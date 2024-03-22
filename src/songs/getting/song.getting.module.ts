import { Module } from "@nestjs/common";
import { SongGettingController } from "./song.getting.controller";
import { SongGettingService } from "./song.getting.service";
import { SongVariantModule } from "../modules/variants/song.variant.module";
import { MediaModule } from "../modules/media/media.module";

@Module({
    imports: [
        SongVariantModule,
        MediaModule
    ],
    controllers: [
        SongGettingController,
    ],
    providers: [
        SongGettingService
    ],
    exports: [
        SongGettingService
    ]
})
export class SongGettingModule {}