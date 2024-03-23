import { Module } from "@nestjs/common";
import { DataSource } from "typeorm";
import { EntitiesProvider } from "./entities.provider";
import { DatasourceModule } from "./datasource/datasource.module";
import { MessengerModule } from "../messenger/messenger.module";

@Module({
    imports: [DatasourceModule, MessengerModule],
    providers: [
        ...EntitiesProvider,
        
    ],
    exports: [
        ...EntitiesProvider
    ],
    controllers: []
})
export class DatabaseModule{}