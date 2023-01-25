import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";

@Injectable()
export class MessengerService {

    constructor(private readonly httpService: HttpService){}


    sendMessage(message:string, after?: ()=>void){
        const PAGE_ID = "111261511852057";
        const PAGE_ACCESS_TOKEN = "EABWyv6p2zCEBAP5nBQuA67C8yyP9Pe2w94jeInVq3TdICJ4l0YK3iSd6w9ZA927HImMib3L06BKhd6EnxHZBpriq9WGIcDBR5jHEtUwWihpepZBhQv3ZB3BPKps4M0jJmjpVQZA3ZAjEKvCb7MHkfCbvIyCizXZBg7nZAZAI0xrJtPsUzBwNmQpyx";
        const PSID = "5642371389193144";

        const url = `https://graph.facebook.com/${PAGE_ID}/messages?recipient={'id':${PSID}}&messaging_type=RESPONSE&message={'text':'${message}'}&access_token=${PAGE_ACCESS_TOKEN}`;


        this.httpService.axiosRef.post(url).then(()=>{
            if(after) after();
        });

    }

}