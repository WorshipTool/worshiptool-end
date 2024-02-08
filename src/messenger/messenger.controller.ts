import { BadRequestException, Body, Controller, Get, Post } from "@nestjs/common";
import { MessengerService } from "./messenger.service";
import { AllowNonUser } from "src/auth/decorators/allownonuser.decorator";
import { PostSendFeedbackBody, PostSendMessageBody } from "./messenger.dto";
import { ApiBadRequestResponse, ApiDefaultResponse, ApiHeader, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("Messenger")
@Controller()
export class MessengerController{

    constructor(
        private messengerService: MessengerService
    ){}

    /**
     * Handles the HTTP POST request for sending feedback.
     * 
     * @param body - The request body containing the feedback details.
     * @returns A formatted response indicating the success of the message sending.
     */
    @ApiOperation({summary: "Sends a feedback to the messenger."})
    @ApiBadRequestResponse({description: "The message is empty."})
    @AllowNonUser()
    @Post("sendfeedback")
    postFeedback(@Body() body: PostSendFeedbackBody){
        if(!body.message){
            throw new BadRequestException("Message is empty")
        }
        let message = "Ahoj, ";
        if(body.userName)
            message += "uživatel " + body.userName + " ";
        else
            message += "někdo (neví se kdo) ";
        message += "ti poslal zpětnou vazbu: \\n";

        const lines = body.message.split("\\n");
        lines.forEach(line=>{
            message += "*" + line.trim() + "*\\n";
        })
        this.messengerService.sendMessage(message);

        return true
    }
    
    /**
     * The function sends a message using the messenger service and returns a success message if the
     * message is not empty. 
     * @param {PostSendMessageBody} body - The parameter `body` is of type `PostSendMessageBody`.
     * @returns a formatted response with a success status code and a message indicating that the
     * message has been sent.
     */
    @ApiOperation({summary: "Sends a message to the messenger."
    })
    @ApiBadRequestResponse({
        description: "The message is empty."
    })
    @AllowNonUser()
    @Post("sendmessage")
    postMessage(@Body() body: PostSendMessageBody){
        if(!body.message){
            throw new BadRequestException("Message is empty")
        }
        this.messengerService.sendMessage(body.message);
        return true;
    }


}