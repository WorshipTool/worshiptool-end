import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";

@Injectable()
export class MessengerService {

    constructor(private readonly httpService: HttpService){}


    async sendMessage(message:string, after?: ()=>void){
       return await this.sendCustomMessage({text: message}, after);

    }

    async sendCustomMessage(messageJson: any, after?: ()=>void){
        const PAGE_ID = "111261511852057";
        const PAGE_ACCESS_TOKEN = "EABWyv6p2zCEBO5oefykyTt9HHvG5z3dfp47S2V30KWoRWZAFh2YLGVUoaqx54NXcHOoR4FR9h0lZA42b8EsF3War6chtwtEgMSGl7LhmiP3eoPUEcnwPzZA5jZBmcZCJ1Tg6uaARj1UsFH7ZAURtp2sljxRF4BRIie2Icgv0n7BkXE2ZCSjgrJgECDjQIKm7AmrUrMrRlweZBKww31xS";
        const PSID = "5642371389193144";

        const messageJsonString = JSON.stringify(messageJson);

        const url = `https://graph.facebook.com/${PAGE_ID}/messages?recipient={'id':${PSID}}&messaging_type=RESPONSE&message=${messageJsonString}&access_token=${PAGE_ACCESS_TOKEN}`;


        return await this.httpService.axiosRef.post(url).then(()=>{
            if(after) after();
        }).catch((e)=>{
            console.log(e);
        });
    }

}