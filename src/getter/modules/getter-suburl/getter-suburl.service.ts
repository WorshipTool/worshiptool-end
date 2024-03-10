import { Inject, Injectable } from "@nestjs/common";
import { GetterSubUrl, GetterSubUrlExploreStatus, GetterSuburlType } from "../../../database/entities/getter/getter-suburl.entity";
import { isUrlValid } from "../../../tech/urls.tech";
import { GetterDomainService } from "../getter-domain/getter-domain.service";
import { In, Repository } from "typeorm";
import { GETTER_SUBURL_REPOSITORY } from "../../../database/constants";
import { isUrlInLengthLimit } from "../../tech/utils";
import { GetterDomain, GetterDomainStatus } from "../../../database/entities/getter/getter-domain.entity";


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
    ".xz",
    ".xlsx",
    ".pptx",
    ".ppt",
    ".xls",
]

@Injectable()
export class GetterSubUrlService{

    constructor(
        private readonly domainService: GetterDomainService,

        @Inject(GETTER_SUBURL_REPOSITORY)
        private suburlRepository: Repository<GetterSubUrl>,
    ){}


    private normalizeUrl(url:string){

        // All http urls are converted to https
        url = url.includes("https://") ? url : url.replace("http://", "https://");

        // Remove last slash
        if(url.endsWith("/")){
            url = url.slice(0, -1);
        }
        return url;
    }
    async addPage(url: string){
        if(!isUrlValid(url)){
            return "Invalid url";
        }

        url = this.normalizeUrl(url);

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

        if(!domain.justCreated){
            // If exists but rejected, return
            if(domain.status === GetterDomainStatus.Rejected){
                return "Cannot add pages to rejected domain";
            }

            const allurl = await this.suburlRepository.findOne({
                where: {
                    domain: {
                        guid: domain.guid
                    },
                    type: GetterSuburlType.DomainShortcut
                }
            })
            if(allurl){
                return "Already exists all url (.../*)";
            }
        }


        const type = this.getUrlType(url);

        await this.suburlRepository.save({
            url, 
            domain, 
            type,
            lastExplored: new Date(),
        })

        return "Done";
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

    getDomainAllUrlString(domainUrl: string) : string {
        const domainString = this.domainService.getDomainString(domainUrl);
        if(!domainString){
            throw new Error("Invalid domain url");
        }
        const url = `https://${domainString}/*`;
        return url;
    }
    getDomainIgnoreString(domainUrl: string) : string {
        const domainString = this.domainService.getDomainString(domainUrl);
        if(!domainString){
            throw new Error("Invalid domain url");
        }
        const url = `https://${domainString}/*ignore*`;
        return url;
    }

    async replaceSuburlsWithAllUrl(domain: GetterDomain){
        return await this.replaceSuburlsWithOneUrl(domain, this.getDomainAllUrlString(domain.domain));
    }

    async replaceSuburlsWithIgnoreUrl(domain: GetterDomain){
        return await this.replaceSuburlsWithOneUrl(domain, this.getDomainIgnoreString(domain.domain));
    }

    private async replaceSuburlsWithOneUrl(domain: GetterDomain, url: string){
        // Remove all suburls for this domain
        this.suburlRepository.delete({
            domain
        });

        const result = await this.addPage(url);

        try{
            const suburl = await this.suburlRepository.findOne({
                where: {
                    url
                }
            });
    
    
            suburl.type = GetterSuburlType.DomainShortcut;
            suburl.explored = GetterSubUrlExploreStatus.Explored;
        
            await this.suburlRepository.save(suburl);
        }catch(e){
            console.log(e);
        }
    }

    async getUrlsCountByDomain(domain: GetterDomain, type?: GetterSuburlType){
        return await this.suburlRepository.count({
            where:{
                domain,
                type: type
            }
        });
    }
}