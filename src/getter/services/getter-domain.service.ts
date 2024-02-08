import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { GETTER_DOMAIN_REPOSITORY, GETTER_SEARCH_REPOSITORY, GETTER_SOURCES_REPOSITORY, GETTER_SUBURL_REPOSITORY } from "src/database/constants";
import { Repository, In } from 'typeorm';
import { GetterDomain, GetterDomainStatus } from "src/database/entities/getter/getter-domain.entity";
import { isUrlValid } from "src/tech/urls.tech";
const rejecties = [
    "facebook",
    "instagram",
    "youtube",
    "twitter",
    "linkedin",
    "pinterest",
    "reddit",
    "tumblr",
    "quora",
    "medium",
    "wordpress",
    "blogspot",
    "wikipedia",
    "google",
    "apple",
    "microsoft",
    "yahoo",
    "bing",
    "duckduckgo",
    "amazon",
    "ebay",
    "spotify",
    "forms.gle",
    "atlassian",
    "slack",
    "discord",
    "zoom",
    "youtu.be"
]

@Injectable()
export class GetterDomainService{
    constructor(
        @Inject(GETTER_DOMAIN_REPOSITORY)
        private domainRepository: Repository<GetterDomain>,

    ){}

    getDomain(url: string) : string | null{
        if(!isUrlValid(url)){
            return null;
        }
        const u = new URL(url);
        let domain = u.hostname;

        domain = domain.replace("www.", "");
    
        if(domain.startsWith("m.")){
            domain = domain.slice(2);
        }

        return domain;
    }

    async getDomainObject(url:string) {
        const domain = this.getDomain(url);
        if(!domain) return null;

        const result = await this.domainRepository.findOne({
            where: {
                domain
            }
        })

        if(!result){
            const autoReject = this.isAutomaticallyRejected(url);
            await this.domainRepository.save({
                domain,
                status: autoReject ? GetterDomainStatus.Rejected : GetterDomainStatus.Pending
            });
            return await this.domainRepository.findOne({
                where: {
                    domain
                }
            });
        }

        return result;
    }

    isAutomaticallyRejected(url: string) : boolean{
        const domain = this.getDomain(url);
        if(!domain) return true;

        for(const reject of rejecties){
            if(domain.includes(reject)){
                return true;
            }
        }

        return false;
    }




}