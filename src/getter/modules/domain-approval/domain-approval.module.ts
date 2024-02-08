import { Module } from "@nestjs/common";
import { DomainApprovalService } from "./domain-approval.service";
import { MessengerService } from "src/messenger/messenger.service";
import { MessengerModule } from "src/messenger/messenger.module";
import { DomainApprovalController } from "./domain-approval.controller";
import { DatabaseModule } from "src/database/database.module";
import { WebhookModule } from "src/webhook/webhook.module";

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