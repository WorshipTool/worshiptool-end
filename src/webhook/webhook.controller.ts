import { BadRequestException, Body, Controller, Get, Post, Query } from "@nestjs/common";
import { WebhookService } from "./webhook.service";
import { ApiTags } from "@nestjs/swagger";
import { AllowNonUser } from "../auth/decorators/allownonuser.decorator";

@ApiTags("Webhook")
@Controller('webhook')
export class WebhookController{
    constructor(
        private readonly webhookService: WebhookService,
    ){}

    
    // Validation for the Facebook webhook
    @AllowNonUser()
    @Get()
    async webhookGet(@Query() query: any){
        const challenge = query["hub.challenge"];
        return challenge;
    }

    @AllowNonUser()
    @Post()
    async webhook(@Body() data: any){
        if(data.object !== "page") throw new BadRequestException("Invalid object");


        const entry = data.entry[0];
        const messaging = entry.messaging[0];

        let type : "message" | "postback" | "other" = "other";

        if(messaging.postback) type = "postback";
        else if(messaging.message) type = "message"; 


        switch(type){
            case "message":
                this.webhookService.dispatchMessageEvent(messaging);
                break;
            case "postback":
                this.webhookService.dispatchPostbackEvent(messaging);
                break;
            default:
                console.log("Unhandled event:")
                console.log(data);
                return "I can only handle postbacks and message for now."
        }
    }
}