import { Controller, Get } from '@nestjs/common';
import * as cron from 'node-cron';
import { DomainApprovalService } from './domain-approval.service';
import { WebhookService } from '../../../webhook/webhook.service';
import { AllowNonUser } from '../../../auth/decorators/allownonuser.decorator';

@Controller('domain-approval')
export class DomainApprovalController{
    constructor(
        private readonly domainApprovalService: DomainApprovalService,
        private readonly webhookService: WebhookService,
    ){
        cron.schedule('39 7 * * *', () => {
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
    async sendNextApproval(){
        const domain = await this.domainApprovalService.chooseDomainToApprove();
        return this.domainApprovalService.sendApprovalMessage(domain)
    }

}