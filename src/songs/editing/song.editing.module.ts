import { Module } from "@nestjs/common";
import { SongEditingController } from "./song.editing.controller";
import { SongEditingService } from "./song.editing.service";
import { SongAddingModule } from "../adding/song.adding.module";
import { DatabaseModule } from "../../database/database.module";
import { SongTitleModule } from "../modules/titles/song.title.module";
import { SongVariantModule } from "../modules/variants/song.variant.module";
import { SongDeletingModule } from "../deleting/song.deleting.module";
import { UrlAliasModule } from "../../urlaliases/url.alias.module";

@Module({
    imports: [
        DatabaseModule,
        SongAddingModule,
        SongTitleModule,
        SongVariantModule,
        SongDeletingModule,
        UrlAliasModule
    ],
    controllers: [
        SongEditingController
    ],
    providers: [
        SongEditingService
    ],
    exports: [
        SongEditingService
    ]
})
export class SongEditingModule{}