import { Controller, Get } from "@nestjs/common";
import * as cron from "node-cron";
import { DomainApprovalService } from "./domain-approval.service";
import { WebhookService } from "../../../webhook/webhook.service";
import { AllowNonUser } from "../../../auth/decorators/allownonuser.decorator";
import { AUTO_GETTER_ACTIVE } from "../../getter.controller";

@Controller("domain-approval")
export class DomainApprovalController {
    constructor(
        private readonly domainApprovalService: DomainApprovalService,
        private readonly webhookService: WebhookService
    ) {
        cron.schedule("39 7 * * *", () => {
            if (AUTO_GETTER_ACTIVE)
                this.domainApprovalService.checkTimeToSend();
        });

        webhookService.addPostbackEventListener((data) => {
            domainApprovalService.handlePostback(data);
        });

        webhookService.addMessageEventListener((data) => {
            domainApprovalService.handleMessage(data);
        });
    }

    @AllowNonUser()
    @Get("sendApproval")
    async sendNextApproval() {
        return this.domainApprovalService.sendNextApproval();
    }
}
