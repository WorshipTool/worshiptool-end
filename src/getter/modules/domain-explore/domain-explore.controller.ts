import { BadRequestException, Body, Controller, Get, NotFoundException, Post, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AllowNonUser } from "../../../auth/decorators/allownonuser.decorator";
import { PostSubUrlLoopDto, PostAddSubUrlDomainDto, PostProcessSubUrlDto } from "../../getter.dto";
import { GetterDomainService } from "../getter-domain/getter-domain.service";
import { DomainExploreSuburlsService } from './domain-explore-suburls.service';
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
        private readonly getterSuburlService: GetterSubUrlService,
        private readonly domainExploreSuburlsService: DomainExploreSuburlsService
    ){

        cron.schedule('30 0 */3 * *', () => {
            this.domainExploreService.checkUpdates();
        });

        cron.schedule('0 2 * * *', () => {
            const time = 60 * 60 * 1000; // 1 hour
            this.suburlService.processSmartLoop(time);
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
    async subUrlLoop(@Body() {time}: PostSubUrlLoopDto){
        if(!time) throw new BadRequestException("No count");

        await this.suburlService.processSmartLoop(time, false);

        return "Done"
        
    }

    @AllowNonUser()
    @Post("processSubUrl")
    async process(@Body() {url}:PostProcessSubUrlDto){
        const subUrl = await this.domainExploreSuburlsService.getEntityByUrl(url);
        if(!subUrl) throw new NotFoundException("Suburl not found");
        return this.domainExploreSuburlsService.processPage(subUrl);
    }

    
    @AllowNonUser()
    @Post("getter/addsuburlpage")
    async addSubUrlPage(@Body() {page}: PostAddSubUrlDomainDto){
        if(!page) throw new BadRequestException("No domain");
        return this.getterSuburlService.addPage(page);
    }

    
    @AllowNonUser()
    @Get("getter/getMetaData")
    async getMetaData(@Query() {page} : PostAddSubUrlDomainDto){
        const result = await this.domainService.getMetaData(page);
        return result;
    }
}