import { Module } from "@nestjs/common";
import { GetterSourceService } from "./getter-source.service";
import { DatabaseModule } from "../../../database/database.module";
import { GetterDomainModule } from "../getter-domain/getter-domain.module";

@Module({
    imports: [
        DatabaseModule,
        GetterDomainModule
    ],
    controllers: [],
    providers: [
        GetterSourceService
    ],
    exports: [
        GetterSourceService
    ]
})
export class GetterSourceModule {}