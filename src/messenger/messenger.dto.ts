import { ApiProperty } from "@nestjs/swagger";
import { messages } from "src/utils/formatted";
import { RequestResultBase } from "src/utils/request.dto";

export class PostSendMessageBody {
    message: string;
}
export class PostSendFeedbackBody{
    message: string
    userName?: string
}