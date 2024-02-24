import { BadRequestException, Body, Controller, ForbiddenException, Get, Inject, InternalServerErrorException, NotFoundException, NotImplementedException, Post, Query } from '@nestjs/common';
import { AllowNonUser } from 'src/auth/decorators/allownonuser.decorator';
import { GetterService } from './getter.service';
import { GetParseUrlQuery, PostAddGetterSourceDto, PostAddSubUrlDomainDto, PostProcessNextResult, PostScreenshotDto, PostSubUrlLoopDto } from './getter.dto';
import { ScrapeResult } from './scripts/scrapers/template/ScrapeResult';
import { ApiTags } from '@nestjs/swagger';
import { MessengerService } from 'src/messenger/messenger.service';
import { GetterDomainService } from './modules/getter-domain/getter-domain.service';
import { GETTER_SUBURL_REPOSITORY } from 'src/database/constants';
import { GetterSubUrl } from 'src/database/entities/getter/getter-suburl.entity';
import { Repository } from 'typeorm';

@ApiTags("Getter")
@Controller()
export class GetterController{

    constructor(
        private readonly getterService: GetterService,
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







}