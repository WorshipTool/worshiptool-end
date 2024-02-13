import { BadRequestException, Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AllowNonUser } from "../../../auth/decorators/allownonuser.decorator";
import { PostSubUrlLoopDto, PostAddSubUrlDomainDto } from "../../getter.dto";
import { GetterDomainService } from "../getter-domain/getter-domain.service";
import { DomainExploreSuburlsService } from "./domain-explore-suburls.service";
import { DomainExploreService } from "./domain-explore.service";
import * as cron from "node-cron";
import { GetterSubUrlService } from "../getter-suburl/getter-suburl.service";

@ApiTags("Getter")
@Controller()
export class DomainExploreController{
    constructor(
        private readonly domainExploreService: DomainExploreService,
        private readonly domainService: GetterDomainService,
        private readonly suburlService: DomainExploreSuburlsService,
        private readonly getterSuburlService: GetterSubUrlService
    ){

        cron.schedule('30 1 * * *', () => {
            this.domainExploreService.checkUpdates();
        });

        cron.schedule('30 2 * * *', () => {
            this.suburlService.processSmartLoop(1000);
        });

    }

    @AllowNonUser()
    @Get("getter/domain/explore")
    async getDomainExplore(@Query("url") url: string){
        const domain = await this.domainService.getDomainObject(url);
        
        return this.domainExploreService.exploreDomain(domain);
    }


    @AllowNonUser()
    @Get("getter/domain/explore/check")
    async getDomainCheck(){
        return this.domainExploreService.checkUpdates();
    }

    
    @AllowNonUser()
    @Post("getter/suburlloop")
    async subUrlLoop(@Body() {count}: PostSubUrlLoopDto){
        if(!count) throw new BadRequestException("No count");

        await this.suburlService.processSmartLoop(count, false);

        return "Done"
        
    }

    
    @AllowNonUser()
    @Post("getter/addsuburldomain")
    async addSubUrlDomain(@Body() {domain}: PostAddSubUrlDomainDto){
        if(!domain) throw new BadRequestException("No domain");
        return this.getterSuburlService.addPage(domain);
    }
}