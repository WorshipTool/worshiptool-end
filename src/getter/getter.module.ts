import { Module } from "@nestjs/common";
import { DomainApprovalModule } from "./modules/domain-approval/domain-approval.module";
import { DomainSearchModule } from "./modules/domain-search/domain-search.module";
import { DomainExploreModule } from "./modules/domain-explore/domain-explore.module";
import { PageExtractModule } from "./modules/page-extract/page-extract.module";


@Module({
    imports: [
        DomainApprovalModule,
        DomainSearchModule,
        DomainExploreModule,
        PageExtractModule
    ],
    controllers: [],
    providers: []
})
export class GetterModule{}