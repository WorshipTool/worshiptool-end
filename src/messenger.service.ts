import { HttpService } from "@nestjs/axios";
import {Inject, Injectable } from "@nestjs/common";
import { INewSongData } from "./database/interfaces";





@Injectable()
export class MessengerService {

    constructor(private readonly httpService: HttpService){}

    sendNewSongForVerification(newSongData: INewSongData, guid: string){
        const message1 = `*${newSongData.title.toUpperCase()}*\\n`
                        + `Do databáze byla přidána nová píseň. Prosím ověř jí. `
                        + `\\nOdkaz:http://192.168.1.253:5500/song/${guid}`
                        + `\\nPro ověření: http://192.168.1.253:3000/songs/verify/${guid}`
                        + `\\nPro zrušení ověření: http://192.168.1.253:3000/songs/unverify/${guid}`;
        this.sendMessage(message1);

    }

    sendVerifiedMessage(guid: string){

    }

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