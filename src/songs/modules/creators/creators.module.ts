import { Module } from "@nestjs/common";
import { CreatorsService } from "./creators.service";
import { DatabaseModule } from "../../../database/database.module";

@Module({
    imports: [
        DatabaseModule
    ],
    controllers: [],
    providers: [
        CreatorsService
    ],
    exports: [
        CreatorsService
    ]
})
export class CreatorsModule {}