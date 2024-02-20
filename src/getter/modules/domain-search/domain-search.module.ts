import { Module } from "@nestjs/common";
import { DomainSearchController } from "./domain-search.controller";
import { DomainSearchService } from "./domain-search.service";
import { GetterDomainService } from "../getter-domain/getter-domain.service";
import { GetterDomainModule } from "../getter-domain/getter-domain.module";
import { DatabaseModule } from "../../../database/database.module";
import { GetterSuburlModule } from "../getter-suburl/getter-suburl.module";
import { DomainSearchQueryService } from "./domain-search-query.service";

@Module({
    imports: [
        DatabaseModule,
        GetterDomainModule,
        GetterSuburlModule
    ],
    controllers: [
        DomainSearchController
    ],
    providers: [
        DomainSearchService,
        DomainSearchQueryService,
    ],
})
export class DomainSearchModule {}