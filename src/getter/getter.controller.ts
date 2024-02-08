import { BadRequestException, Body, Controller, ForbiddenException, Get, Inject, InternalServerErrorException, NotFoundException, NotImplementedException, Post, Query } from '@nestjs/common';
import { AllowNonUser } from 'src/auth/decorators/allownonuser.decorator';
import { GetterService } from './getter.service';
import { GetParseUrlQuery, PostAddGetterSourceDto, PostAddSubUrlDomainDto, PostProcessNextResult, PostScreenshotDto, PostSubUrlLoopDto } from './getter.dto';
import { ScrapeResult } from './scrapers/ScrapeResult';
import { ApiTags } from '@nestjs/swagger';
import { MessengerService } from 'src/messenger/messenger.service';
import { GetterSubUrlService } from './services/getter-suburl.service';
import { GetterDomainService } from './services/getter-domain.service';
import { GETTER_SUBURL_REPOSITORY } from 'src/database/constants';
import { GetterSubUrl } from 'src/database/entities/getter/getter-suburl.entity';
import { Repository } from 'typeorm';

@ApiTags("Getter")
@Controller()
export class GetterController{

    constructor(
        private readonly getterService: GetterService,
        private readonly messagerService: MessengerService,
        private readonly suburlService: GetterSubUrlService,
        private readonly domainService: GetterDomainService,

        @Inject(GETTER_SUBURL_REPOSITORY)
        private suburlRepository: Repository<GetterSubUrl>,
    ){}

    @AllowNonUser()
    @Post("getter/add")
    add(@Body() data: PostAddGetterSourceDto){
        return this.getterService.add(data);
    }

    @AllowNonUser()
    @Post("getter/next")
    async next() : Promise<PostProcessNextResult>{
        return await this.getterService.processNext();
    }

    @AllowNonUser()
    @Get("getter/parseurl")
    async parseUrl(@Query() query: GetParseUrlQuery) : Promise<ScrapeResult>{
        const result = await this.getterService.parseUrl(query.url);
        return result;
        
    }

    @AllowNonUser()
    @Get("getter/search")
    async search(){
        return this.getterService.search();

    }



    @AllowNonUser()
    @Get("getter/getsuburls")
    async getSubUrls(@Query("url") url: string){
        return this.suburlService.getAllSubUrls(url);
    }

    @AllowNonUser()
    @Get("getter/processnextsuburl")
    async processNextSubUrl(){
        return this.suburlService.processNext();
    }

    @AllowNonUser()
    @Post("getter/addsuburldomain")
    async addSubUrlDomain(@Body() {domain}: PostAddSubUrlDomainDto){
        if(!domain) throw new BadRequestException("No domain");
        return this.suburlService.addDomain(domain);
    }

    @AllowNonUser()
    @Post("getter/suburlloop")
    async subUrlLoop(@Body() {count}: PostSubUrlLoopDto){
        if(!count) throw new BadRequestException("No count");

        const MAX_PER_LOOP = 1000;
        const loops = Math.ceil(count / MAX_PER_LOOP);

        console.log("Request split into " + loops + " parts:");

        for(let i = 0; i < loops; i++){
            console.log("--- STARTING PART", i+1, "of", loops, "---");
            const result = await this.suburlService.processLoop(MAX_PER_LOOP, false);
        }

        return "Done"
        
    }

}