import { customsearch } from "@googleapis/customsearch";
import { Injectable, Inject } from "@nestjs/common";
import { Repository } from "typeorm";
import { GETTER_SEARCH_REPOSITORY } from "../../../database/constants";
import { GetterSearch } from "../../../database/entities/getter/getter-search.entity";
import { GetterDomainService } from "../getter-domain/getter-domain.service";
import { GetterSubUrlService } from "../getter-suburl/getter-suburl.service";
import { DomainSearchQueryService } from "./domain-search-query.service";

const searchMockData = [
    {
        title: "Píseň 1",
        link: "https://www.pisen1.cz"
    },
    {
        title: "Píseň 2",
        link: "https://www.pisen2.cz"
    },
    {
        title: "Píseň 3",
        link: "https://www.pisen3.cz"
    }
]

const key = "AIzaSyA4OWcFUwakif-pdoQWaW_Fy6Q8DVbxnGE";
const cx = "675c65a6e9ad74cb5"

const MAX_SEARCH_REQUESTS_PER_DAY = 90;

@Injectable()
export class DomainSearchService{
    constructor(
        @Inject(GETTER_SEARCH_REPOSITORY)
        private searchRepository: Repository<GetterSearch>,
        private suburlService: GetterSubUrlService,
        private domainService: GetterDomainService,
        private queryService: DomainSearchQueryService
    ){}

    requestsCountThisDay = 0;
    clearLimitValue(){
        this.requestsCountThisDay = 0;
    }

    raiseLimitValue(){
        this.requestsCountThisDay++;
    }


    async search(allowReturnMockData: boolean = false){

        const inLimitInterval = this.requestsCountThisDay < MAX_SEARCH_REQUESTS_PER_DAY;
        if(!inLimitInterval && !allowReturnMockData){
            return null;
        }
        const useMockData = false || (!inLimitInterval && allowReturnMockData);


        
        const query = await this.queryService.getSearchQuery(useMockData);

        
        let resultItems = [];
        if(useMockData){
            resultItems = searchMockData
        }else{
            this.raiseLimitValue();

            const empty = {data: {items: [], queries: {}}}

            let error = false;
            let result : any = empty;
            try{
                result = await customsearch("v1").cse.list({
                    cx, key,
                    q: query.query,
                    start: query.page*10 + 1
                })
            }catch(e){
                console.log("Error", e.message);
                error = true;
            }

            const existing = await this.searchRepository.findOne({
                where:{
                    query: query.query
                }
            });

            const hasNext = error ? false : Boolean(result.data.queries.nextPage);
    

            if(!existing){
                await this.searchRepository.createQueryBuilder().insert().values({
                    query: query.query,
                    lastSearch: new Date(),
                    lastPage: query.page,
                    processedAll: !hasNext
                }).execute();
            }else{
                this.searchRepository.createQueryBuilder().update().set({
                    lastPage: query.page,
                    processedAll: !hasNext
                }).where({
                    guid: existing.guid
                }).execute();
            }

            if(error) return null;

            resultItems = result.data.items || [];
        }

        const items : {
            title: string,
            url: string,
            domain: string
        }[] = resultItems.map((item)=>{
            return {
                title: item.title,
                url: item.link,
                domain: this.domainService.getDomainString(item.link)
            }
        })

        let newCount = 0;

        if(!useMockData){
            // Every new domain should be added to the database
            const urls = items.map((item)=>item.url);
            for(const d of urls){
                const existing = await this.domainService.getDomainObject(d);
                if(existing.justCreated){
                    newCount++;
                }
                await this.suburlService.addPage(d);


            }
        }

        
        return {
            message: inLimitInterval ? "OK" : "Limit reached. Mock data returned",
            query,
            count: items.length,
            newCount: newCount,
            items,
        }

    }

    async searchLoop(print:boolean = true){
        for(let i = 0; i < MAX_SEARCH_REQUESTS_PER_DAY; i++){
            const result = await this.search();
            if(!result) return;
            if(print) console.log("Searched:",result.count, "new:", result.newCount);

        }
        if(print) console.log("Done")
        return "Done";
    }

}