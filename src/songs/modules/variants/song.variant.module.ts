import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../../database/database.module";
import { SongVariantService } from "./song.variant.service";
import { CreatorsModule } from "../creators/creators.module";
import { SongTitleModule } from "../titles/song.title.module";
import { UrlAliasModule } from "../../../urlaliases/url.alias.module";

@Module({
    imports: [DatabaseModule, CreatorsModule, SongTitleModule, UrlAliasModule],
    controllers: [],
    providers: [SongVariantService],
    exports: [SongVariantService]
})
export class SongVariantModule {}
