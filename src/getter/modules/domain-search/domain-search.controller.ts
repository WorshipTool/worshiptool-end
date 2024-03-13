import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AllowNonUser } from "../../../auth/decorators/allownonuser.decorator";
import { DomainSearchService } from "./domain-search.service";
import * as cron from 'node-cron';

@ApiTags("Getter")
@Controller()
export class DomainSearchController {
    constructor(
        private readonly domainSearchService: DomainSearchService
    ){
        cron.schedule('59 23 * * *', () => {
            domainSearchService.clearLimitValue();
        });

        cron.schedule('0 1 * * *', () => {
            domainSearchService.searchLoop();
        });
    }

    @AllowNonUser()
    @Get("search")
    search(){
        return this.domainSearchService.search(true);
    }
}