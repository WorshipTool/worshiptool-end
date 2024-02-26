import { Module } from "@nestjs/common";
import { DomainApprovalModule } from "./modules/domain-approval/domain-approval.module";
import { DomainSearchModule } from "./modules/domain-search/domain-search.module";
import { DomainExploreModule } from "./modules/domain-explore/domain-explore.module";
import { SourceExtractModule } from "./modules/source-process/source-extract/source-extract.module";
import { SourceProcessModule } from "./modules/source-process/source-process.module";


@Module({
    imports: [
        DomainApprovalModule,
        DomainSearchModule,
        DomainExploreModule,
        SourceProcessModule
    ],
    controllers: [],
    providers: []
})
export class GetterModule{}