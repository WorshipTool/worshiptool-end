import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { Repository } from "typeorm";
import { GETTER_DOMAIN_REPOSITORY } from "../../../database/constants";
import { GetterDomain, GetterDomainStatus } from "../../../database/entities/getter/getter-domain.entity";
import { isUrlValid } from "../../../tech/urls.tech";

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

type GetterDomainObject = GetterDomain & {justCreated?: boolean};

@Injectable()
export class GetterDomainService{
    constructor(
        @Inject(GETTER_DOMAIN_REPOSITORY)
        private domainRepository: Repository<GetterDomain>,

    ){}

    getDomainString(url: string) : string | null{
        if(!isUrlValid(url)){
            url = "https://" + url;
        }
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

    /***
     * Get domain object from database
     * If not exists, create it
     */
    async getDomainObject(url:string, createIfNotExist: boolean = true) : Promise<GetterDomainObject> {
        let domain = this.getDomainString(url)
        if(!domain){
            domain = url;
            createIfNotExist = false;
        }

        const result = await this.domainRepository.findOne({
            where: {
                domain
            }
        })

        if(result) return {
            ...result,
            justCreated: false
        }

        if(createIfNotExist){
            const parentDomainString = this.getParentDomainString(domain);
            const parentDomain = parentDomainString 
                ? await this.getDomainObject(parentDomainString) 
                : null

            const level = this.getDomainLevel(domain);
            const autoReject = this.isAutomaticallyRejected(url);
            await this.domainRepository.save({
                domain,
                status: autoReject ? GetterDomainStatus.Rejected : GetterDomainStatus.Pending,
                parent: parentDomain,
                level
            });
            const result =  await this.domainRepository.findOne({
                where: {
                    domain
                }
            });

            return {
                ...result,
                justCreated: true
            }
        }

        return null
    }


    isAutomaticallyRejected(url: string) : boolean{
        const domain = this.getDomainString(url);
        if(!domain) return true;

        if(domain.endsWith("."))
            return true;

        for(const reject of rejecties){
            if(domain.includes(reject)){
                return true;
            }
        }

        return false;
    }

    getParentDomainString(domain: string){
        const parts = domain.split(".");

        if(parts.length === 1){
            return null;
        }
        const onlyParts = parts.slice(1);

        const str = onlyParts.join(".");
        return str;
    }

    getDomainLevel(url: string){
        url = this.getDomainString(url);
        const parts = url.split(".");

        return parts.length - 1;
    }



}