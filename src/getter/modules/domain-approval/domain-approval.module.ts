import { Module } from "@nestjs/common";
import { DomainApprovalService } from "./domain-approval.service";
import { DatabaseModule } from "../../../database/database.module";
import { MessengerModule } from "../../../messenger/messenger.module";
import { WebhookModule } from "../../../webhook/webhook.module";
import { DomainApprovalController } from "./domain-approval.controller";

@Module({
    imports: [
        MessengerModule,
        DatabaseModule,
        WebhookModule
    ],
    controllers: [
        DomainApprovalController
    ],
    providers: [
        DomainApprovalService,
        
    ],
})
export class DomainApprovalModule {}