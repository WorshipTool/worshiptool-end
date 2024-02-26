import { Module } from "@nestjs/common";
import { SourceExtractService } from "./source-extract.service";
import { ParserService } from "../../../../songs/services/parser.service";
import { DatabaseModule } from "../../../../database/database.module";

@Module({
    imports: [
        DatabaseModule
    ],
    controllers: [],
    providers: [
        SourceExtractService,
        ParserService
    ],
    exports: [
        SourceExtractService
    ]
})
export class SourceExtractModule {}