import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";

@Injectable()
export class MessengerService {

    constructor(private readonly httpService: HttpService){}


    async sendMessage(message:string, after?: ()=>void){
       return await this.sendCustomMessage({text: message}, after);

    }

    async sendCustomMessage(messageJson: any, after?: ()=>void){
        const PAGE_ID = process.env.META_PAGE_ID;
        const PAGE_ACCESS_TOKEN = process.env.META_PAGE_ACCESS_TOKEN;
        const PSID = process.env.META_PSID;

        const messageJsonString = JSON.stringify(messageJson);

        const url = `https://graph.facebook.com/${PAGE_ID}/messages?recipient={'id':${PSID}}&messaging_type=RESPONSE&message=${messageJsonString}&access_token=${PAGE_ACCESS_TOKEN}`;


        return await this.httpService.axiosRef.post(url).then(()=>{
            if(after) after();
        }).catch((e)=>{
            console.log(e);
        });
    }

}