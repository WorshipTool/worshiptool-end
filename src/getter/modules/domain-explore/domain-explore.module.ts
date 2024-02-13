import { Module } from "@nestjs/common";
import { DomainExploreService } from "./domain-explore.service";
import { DomainExploreController } from "./domain-explore.controller";
import { DomainExploreUtilsService } from "./domain-explore-utils.service";
import { GetterSourceModule } from "../getter-source/getter-source.module";
import { DomainExploreSuburlsService } from "./domain-explore-suburls.service";
import { DatabaseModule } from "../../../database/database.module";
import { GetterSuburlModule } from "../getter-suburl/getter-suburl.module";

@Module({
    imports: [
        DatabaseModule,
        GetterSourceModule,
        GetterSuburlModule
    ],
    controllers: [
        DomainExploreController
    ],
    providers: [
        DomainExploreService,
        DomainExploreUtilsService,
        DomainExploreSuburlsService
    ],
})
export class DomainExploreModule {}