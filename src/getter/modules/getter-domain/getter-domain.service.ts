import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { Repository } from "typeorm";
import { GETTER_DOMAIN_REPOSITORY } from "../../../database/constants";
import { GetterDomain, GetterDomainStatus, MAX_GETTER_DOMAIN_DESCRIPTION_LENGTH, MAX_GETTER_DOMAIN_TITLE_LENGTH } from "../../../database/entities/getter/getter-domain.entity";
import { isUrlValid } from "../../../tech/urls.tech";
import * as cheerio from "cheerio";
import { normalizeCzechString } from '../../../tech/string.tech';

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

type KeyPair = [string, number] | [string];

const probalityKeys : KeyPair[] = [
    ["křest"],
    ["círk"],
    ["kostel"],
    ["bibl"],
    ["zpev"],
    ["modlit"],
    ["kaza"],
    ["fara"],
    ["farn", 0.2],
    ["pisn"],
    ["pisen"],
    ["worship", 0.6],
    ["noty"],
    ["church",0.2],
    ["song"],
    ["praise",0.1],
    ["tab"],
    ["akord"],
    ["chord"]
]

const keysAmountSum = probalityKeys.reduce((acc, pair) => acc + (pair[1] || 1), 0);

type GetterDomainObject = GetterDomain & {justCreated?: boolean};

type MetaData = {
    title: string,
    description: string,
    url: string,
    site_name: string,
    image: string,
    icon: string,
    keywords: string
}

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
            // Create domain

            const parentDomainString = this.getParentDomainString(domain);
            const parentDomain = parentDomainString 
                ? await this.getDomainObject(parentDomainString) 
                : null

            const level = this.getDomainLevel(domain);
            const autoReject = this.isAutomaticallyRejected(url);

            const metaData = level > 0 ? await this.getMetaData(url) : null;
            const title = metaData?.title?.slice(0, MAX_GETTER_DOMAIN_TITLE_LENGTH) || null;
            const description = metaData?.description?.slice(0, MAX_GETTER_DOMAIN_DESCRIPTION_LENGTH) || null;

            const probality = level > 0 ? (await this.calculateProbality(url, metaData)) * 100 : null;

            await this.domainRepository.save({
                domain,
                status: autoReject ? GetterDomainStatus.Rejected : GetterDomainStatus.Pending,
                parent: parentDomain,
                level,
                title,
                description,
                probality
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

    /**
     * 
     * @param domainUrl 
     * @param metaData 
     * @returns Coeficient in range 0-1
     */
    async calculateProbality(domainUrl:string, metaData?: MetaData){
        try{
            if(!metaData) metaData = await this.getMetaData(domainUrl);
            if(!metaData) return 0;
        }catch(e){
            console.log(e);
            return 0;
        }

        const q = metaData.title || "" + metaData.description || "" + metaData.keywords || "";
        if(q.length === 0) return 0.5;

        const qLower = normalizeCzechString(q.toLocaleLowerCase());



        let probality = 0;
        for(const pair of probalityKeys){
            const key = pair[0];
            const k = normalizeCzechString(key);
            if(qLower.includes(k)){
                const coef = pair[1] || 1;
                probality += coef;
            }
        }

        probality /= keysAmountSum;
        return Math.min(1, Math.max(0, probality));

    }
    async getMetaData(domainUrl: string){
        const domainString = this.getDomainString(domainUrl);
        if(!domainString) throw new BadRequestException("Invalid domain");
        const url = "https://" + domainString;

        const data : MetaData | null = await fetch(url)
        .then(result => result.text())
        .then(html => {
            const $ = cheerio.load(html);
            const title = $('meta[property="og:title"]').attr('content') || $('title').text() || $('meta[name="title"]').attr('content')
            const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content')
            const url = $('meta[property="og:url"]').attr('content')
            const site_name = $('meta[property="og:site_name"]').attr('content')
            const image = $('meta[property="og:image"]').attr('content') || $('meta[property="og:image:url"]').attr('content')
            const icon = $('link[rel="icon"]').attr('href') || $('link[rel="shortcut icon"]').attr('href')
            const keywords = $('meta[property="og:keywords"]').attr('content') || $('meta[name="keywords"]').attr('content')
            
            return {
                title,
                description,
                url,
                site_name,
                image,
                icon,
                keywords
            }
        }).catch(error => {
            console.log(error);
            return null;
        })

        return data;
    }



}