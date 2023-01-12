import { Module } from "@nestjs/common";
import { DataSource } from "typeorm";
import { EntitiesProvider } from "./entities.provider";

@Module({
    imports: [DataSource],
    providers: [
        ...EntitiesProvider
    ],
    controllers: []
})
export class DatabaseModule{}