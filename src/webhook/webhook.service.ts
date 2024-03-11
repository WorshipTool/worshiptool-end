import { Injectable } from "@nestjs/common";

@Injectable()
export class WebhookService{
    constructor(){}

    postbackEventActions: any = [];
    messagesEventActions: any = [];

    async addPostbackEventListener(data: (data: any) => void){
        this.postbackEventActions.push(data);
    }

    async addMessageEventListener(data: (data: any) => void){
        this.messagesEventActions.push(data);
    }

    async dispatchPostbackEvent(data: any){
        for(const action of this.postbackEventActions){
            action(data);
        }
    }

    async dispatchMessageEvent(data: any){
        for(const action of this.messagesEventActions){
            action(data);
        }
    }
}