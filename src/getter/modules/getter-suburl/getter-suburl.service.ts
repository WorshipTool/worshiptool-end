import { Inject, Injectable } from "@nestjs/common";
import { GetterSubUrl, GetterSuburlType } from "../../../database/entities/getter/getter-suburl.entity";
import { isUrlValid } from "../../../tech/urls.tech";
import { GetterDomainService } from "../getter-domain/getter-domain.service";
import { Repository } from "typeorm";
import { GETTER_SUBURL_REPOSITORY } from "../../../database/constants";
import { isUrlInLengthLimit } from "../../tech/utils";


const audioEndings = [
    ".mp3",
    ".wav",
    ".flac",
    ".ogg",
]

const imageEndings = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
]

const videoEndings = [
    ".mp4",
    ".avi",
    ".mkv",
    ".webm",
]

const otherEndings = [
    ".pdf",
    ".doc",
    ".docx",
    ".txt",
    ".zip",
    ".rar",
    ".7z",
    ".tar",
    ".gz",
    ".bz2",
    ".xz"
]

@Injectable()
export class GetterSubUrlService{

    constructor(
        private readonly domainService: GetterDomainService,

        @Inject(GETTER_SUBURL_REPOSITORY)
        private suburlRepository: Repository<GetterSubUrl>,
    ){}


    async addPage(url: string){
        if(!isUrlValid(url)){
            return "Invalid url";
        }

        if(!isUrlInLengthLimit(url)){
            return "Url too long";
        }

        if(await this.suburlRepository.findOne({
            where:{
                url
            }
        })){
            return "Already exists";
        }

        const domain = await this.domainService.getDomainObject(url);
        const type = this.getUrlType(url);

        await this.suburlRepository.save({
            url, 
            domain, 
            type,
            lastExplored: new Date(),
        })
        return "Done"
    }

    async addPages(urls: string[]){
        for(const url of urls){
            await this.addPage(url);
        }
    }
    

    getUrlType(url: string) : GetterSuburlType{
        if(!isUrlValid(url)){
            return null;
        }

        const u = new URL(url);
        const path = u.pathname;


        if(audioEndings.some((ending)=>path.endsWith(ending))){
            return GetterSuburlType.Audio;
        }

        if(imageEndings.some((ending)=>path.endsWith(ending))){
            return GetterSuburlType.Image;
        }

        if(videoEndings.some((ending)=>path.endsWith(ending))){
            return GetterSuburlType.Video;
        }

        if(otherEndings.some((ending)=>path.endsWith(ending))){
            return GetterSuburlType.Other;
        }

    }
}