import { Body, Controller, Post } from "@nestjs/common";
import { MessengerService } from "./messenger.service";
import { PostSendFeedbackBody } from "./dtos";
import { AllowNonUser } from "src/auth/decorators/allownonuser.decorator";
import { codes, formatted } from "src/utils/formatted";

@Controller()
export class MessengerController{

    constructor(
        private messengerService: MessengerService
    ){}

    @AllowNonUser()
    @Post("sendfeedback")
    postFeedback(@Body() body: PostSendFeedbackBody){
        let message = "Ahoj, ";
        if(body.userName)
            message += "uživatel " + body.userName + " ";
        else
            message += "někdo (neví se kdo) ";
        message += "ti poslal zpětnou vazbu: \\n";
        message += "*"+ body.message + "*" ;
        this.messengerService.sendMessage(message);

        return formatted(undefined, codes.Success, "Message sent")
    }

}