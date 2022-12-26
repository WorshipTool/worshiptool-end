import { Module } from "@nestjs/common";
import { DatabaseController } from "./database.controller";
import { DatabaseModule } from "./database.module";
import { EntitiesProvider } from "./entities.provider";
import { CSVLinkService } from "./services/csvlink.service";
import { CreatorService } from "./services/creator.service";
import { SongService } from "./services/song.service";
import { SongVariantService } from "./services/songvariant.service";

@Module({
  imports: [DatabaseModule],
  providers: [
    ...EntitiesProvider,
    SongVariantService,
    SongService,
    CreatorService,
    CSVLinkService
  ],
  controllers: [DatabaseController]
})
export class EntitiesModule {}