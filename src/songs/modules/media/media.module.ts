import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../../database/database.module";
import { MediaService } from "./media.service";

@Module({
    imports: [
        DatabaseModule
    ],
    controllers: [],
    providers: [
        MediaService
    ],
    exports: [
        MediaService
    ]
})
export class MediaModule{}