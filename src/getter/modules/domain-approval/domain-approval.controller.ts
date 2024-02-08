import { Controller } from '@nestjs/common';
import * as cron from 'node-cron';
import { DomainApprovalService } from './domain-approval.service';
import { WebhookService } from 'src/webhook/webhook.service';

@Controller('domain-approval')
export class DomainApprovalController{
    constructor(
        private readonly domainApprovalService: DomainApprovalService,
        private readonly webhookService: WebhookService,
    ){
        cron.schedule('11 * * * *', () => {
            this.domainApprovalService.checkTimeToSend();
        });

        webhookService.addPostbackEventListener((data) => {
            domainApprovalService.handlePostback(data);
        });

        webhookService.addMessageEventListener((data) => {
            domainApprovalService.handleMessage(data);
        });
    }

    

}