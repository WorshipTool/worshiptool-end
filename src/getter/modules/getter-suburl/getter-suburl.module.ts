import { Module } from "@nestjs/common";
import { GetterSubUrlService } from "./getter-suburl.service";
import { GetterDomainService } from "../getter-domain/getter-domain.service";
import { GetterDomainModule } from "../getter-domain/getter-domain.module";
import { DatabaseModule } from "../../../database/database.module";

@Module({
    imports: [
        GetterDomainModule,
        DatabaseModule
    ],
    controllers: [],
    providers: [
        GetterSubUrlService
    ],
    exports: [
        GetterSubUrlService
    ]
})
export class GetterSuburlModule {}