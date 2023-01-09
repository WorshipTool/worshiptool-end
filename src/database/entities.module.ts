import { Module } from "@nestjs/common";
import { DatabaseController } from "./database.controller";
import { DatabaseModule } from "./database.module";
import { EntitiesProvider } from "./entities.provider";
import { CSVLinkService } from "./services/csvlink.service";
import { CreatorService } from "./services/creator.service";
import { SongService } from "./services/song.service";
import { SongVariantService } from "./services/songvariant.service";
import { MessengerService } from "src/messenger.service";
import { HttpModule } from "@nestjs/axios";
import { AuthController } from "../auth/auth.controller";

@Module({
  imports: [DatabaseModule, HttpModule],
  providers: [
    ...EntitiesProvider,
    SongVariantService,
    SongService,
    CreatorService,
    CSVLinkService,
    MessengerService
  ],
  controllers: [DatabaseController]
})
export class EntitiesModule {}