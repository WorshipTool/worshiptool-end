import { Module } from "@nestjs/common";
import { SongService } from "./song.service";
import { DatabaseModule } from "../../../database/database.module";
import { UrlAliasModule } from "../../../urlaliases/url.alias.module";

@Module({
    imports: [DatabaseModule, UrlAliasModule],
    controllers: [],
    providers: [SongService],
    exports: [SongService]
})
export class SongModule {}
