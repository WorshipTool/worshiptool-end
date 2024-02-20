import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";

@Injectable()
export class MessengerService {

    constructor(private readonly httpService: HttpService){}


    async sendMessage(message:string, after?: ()=>void){
       return await this.sendCustomMessage({text: message}, after);

    }

    async sendCustomMessage(messageJson: any, after?: ()=>void){
        // const PAGE_ID = "218125798058675";//"111261511852057";
        // // const PAGE_ACCESS_TOKEN = "EABWyv6p2zCEBO5oefykyTt9HHvG5z3dfp47S2V30KWoRWZAFh2YLGVUoaqx54NXcHOoR4FR9h0lZA42b8EsF3War6chtwtEgMSGl7LhmiP3eoPUEcnwPzZA5jZBmcZCJ1Tg6uaARj1UsFH7ZAURtp2sljxRF4BRIie2Icgv0n7BkXE2ZCSjgrJgECDjQIKm7AmrUrMrRlweZBKww31xS";
        // const PAGE_ACCESS_TOKEN = "EAAFLCp4HYQwBOwIaukLyQxosePjj1folkJqqmqxZCj6AZA8dqsS5EydPkF8JLZCeDUkJQenn7nfzCUZBeZCcMwh7yECFZAEZBDyhXzpZCPWvO40UBs9VpjHZAMZA0g4urV0IQuwBYHdq1EiSZCH4F8uNUFLpgEODsdvZAaMg1pShNv1TZAyBIhfKyf4avPZBU8VNibZAXShtAj0NPRyj9znt9d1";
        // const PSID = "7120822827971322";//"5642371389193144";
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