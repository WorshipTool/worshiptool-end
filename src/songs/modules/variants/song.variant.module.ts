import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../../database/database.module";
import { SongVariantService } from "./song.variant.service";

@Module({
    imports: [
        DatabaseModule
    ],
    controllers: [],
    providers: [
        SongVariantService
    ],
    exports: [
        SongVariantService
    ]
})
export class SongVariantModule{}