import { Module } from "@nestjs/common";
import { GetterDomainService } from "./getter-domain.service";
import { DatabaseModule } from "../../../database/database.module";

@Module({
    imports: [
        DatabaseModule
    ],
    controllers: [],
    providers: [
        GetterDomainService
    ],
    exports: [
        GetterDomainService
    ]
})
export class GetterDomainModule {}