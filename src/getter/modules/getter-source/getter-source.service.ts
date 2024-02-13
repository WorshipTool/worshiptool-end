import { Inject, Injectable } from "@nestjs/common";
import { In, Repository } from "typeorm";
import { GETTER_SOURCES_REPOSITORY } from "../../../database/constants";
import { GetterSource } from "../../../database/entities/getter/getter-source.entity";
import { isUrlValid } from "../../../tech/urls.tech";
import { isUrlInLengthLimit } from "../../utils";
import { GetterDomainService } from "../getter-domain/getter-domain.service";

@Injectable()
export class GetterSourceService{
    constructor(
        @Inject(GETTER_SOURCES_REPOSITORY)
        private sourcesRepository: Repository<GetterSource>,
        private domainService: GetterDomainService
    ){}

    async addSource(url: string){
        if(!url) return null;
        if(!isUrlValid(url)) return null;
        if(!isUrlInLengthLimit(url)){
            console.log("Url too long")
            return null;
        }

        const source = await this.sourcesRepository.findOne({
            where: {
                url
            }
        });
        if(source){
            return source;
        }
        const domain = await this.domainService.getDomainObject(url);
        return await this.sourcesRepository.create({url, domain});

    }

    async addSources(urls: string[]){
        // get all urls that are not in the database

        //Make urls unique
        urls = urls.filter((url, index) => urls.indexOf(url) === index);

        const sources = await this.sourcesRepository.find({
            where: {
                url: In(urls)
            }
        });

        const newUrls = urls
            .filter(url => !sources.find(source => source.url === url))
            .filter(url => isUrlValid(url))
            .filter(url => isUrlInLengthLimit(url));

        const values = [];
        for(const url of newUrls){
            const domain = await this.domainService.getDomainObject(url);
            values.push({url, domain});
        }

        return await this.sourcesRepository.save(values);








    }
}