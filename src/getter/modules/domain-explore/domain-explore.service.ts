import { Inject, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { Repository } from "typeorm";
import { GETTER_EXPLORE_REPOSITORY, GETTER_DOMAIN_REPOSITORY } from "../../../database/constants";
import { GetterDomain } from "../../../database/entities/getter/getter-domain.entity";
import { GetterExplore } from "../../../database/entities/getter/getter-explore.entity";
import { ExploreResult } from "../../scripts/explorers/template/ExploreResult";
import { ExplorerTemplate } from "../../scripts/explorers/template/ExplorerTemplate";
import { GetterDomainService } from "../getter-domain/getter-domain.service";
import { GetterSourceService } from "../getter-source/getter-source.service";
import { DomainExploreUtilsService } from "./domain-explore-utils.service";
import * as config from "../../scripts/config.json";
import * as fs from 'fs';

@Injectable()
export class DomainExploreService{
    constructor(
        @Inject(GETTER_EXPLORE_REPOSITORY)
        private exploreRepository: Repository<GetterExplore>,
        @Inject(GETTER_DOMAIN_REPOSITORY)
        private domainRepository: Repository<GetterDomain>,

        private exploreUtils: DomainExploreUtilsService,
        private domainService: GetterDomainService,
        private sourceService: GetterSourceService
    ){}

    
    findExplorer(url: string){
        for(const page of config.pages){
            if(!url.includes(page.domain)) continue;

            if(page.explorer){
                return page;
            }
        }
        return null;
    }

    async exploreDomain(domain: GetterDomain){
        const explorerData = this.findExplorer(domain.domain);

        if(!explorerData){
            domain.hasExplorer = false;
            await this.domainRepository.save(domain);

            throw new NotFoundException("Explorer for this domain not found"); 
        }
        // Check if scraperData.extracter file exists
        if(!fs.existsSync(explorerData.extracter)){

            domain.hasExplorer = false;
            await this.domainRepository.save(domain);

            throw new NotFoundException("Explorer file not found");
        }


        domain.hasExplorer = true;
        await this.domainRepository.save(domain);


        require('ts-node/register');

        const explorerClass = require(explorerData.explorer)

        const explorer : ExplorerTemplate = new explorerClass.default();
        const data = explorer.explore(this.exploreUtils.getHtml);

        return data;
    }

    async checkUpdates(){
        const domains = (await this.domainRepository.find({
            where: {
                hasExplorer: true,
            }
        }));

        const domainsStrings = config.pages
            .filter(page => page.extracter)
            .map(page => page.domain)

        for(const domainString of domainsStrings){
            if(domains.find(domain => domain.domain === domainString)) continue;

            const domain = await this.domainService.getDomainObject(domainString, false);
            if(domain){
                domains.push(domain);
            }
        }

        const results : ExploreResult[] = []

        for(const domain of domains){
            try{
                const result = await this.exploreDomain(domain);
                results.push(result);
                await this.exploreRepository.save({
                    domain,
                    count: result.items.length,
                    date: new Date()
                });
            }catch(e){

                console.error("Error exploring domain", domain, e.message);
            }

        }

        const urls = results.map(r=>r.items).flat().map(i=>i.url);

        await this.sourceService.addSources(urls);


        return results;
        



    }

}