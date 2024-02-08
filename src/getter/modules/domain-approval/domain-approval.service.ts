import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { GETTER_DOMAIN_REPOSITORY } from 'src/database/constants';
import { GetterDomain, GetterDomainStatus } from 'src/database/entities/getter/getter-domain.entity';
import { MessengerService } from 'src/messenger/messenger.service';
import { Repository } from 'typeorm';


const autoTitles = [
    "Nalezli jsme novou doménu!",
    "Našli jsme novou stránku!",
    "Nová doména ke schválení!"
]

const notAutoTitles = [
    "Zde je další doména",
    "Tady máte další!",
    "Další doména ke schválení"
]

@Injectable()
export class DomainApprovalService{
    constructor(
        private messengerService: MessengerService,
        @Inject(GETTER_DOMAIN_REPOSITORY)
        private domainRepository: Repository<GetterDomain>,
    ){}

    async checkTimeToSend(){
        this.sendNextApproval();
    }

    
    async chooseDomainToApprove() : Promise<GetterDomain|null>{
        const domain = await this.domainRepository.findOne({
            where:{
                status: GetterDomainStatus.Pending
            }
        });

        return domain as GetterDomain | null;
    }

    async sendApprovalMessage(domain: GetterDomain, autoCall : boolean = true){


        const url = domain.domain;
        const title = autoCall ? 
            autoTitles[Math.floor(Math.random() * autoTitles.length)] : 
            notAutoTitles[Math.floor(Math.random() * notAutoTitles.length)];

        const subtitle = `Ověř zda ${domain.domain} obsahuje pouze křesťanské písničky.`;

        this.messengerService.sendCustomMessage({
            "attachment":{
              "type":"template",
              "payload":{
                "template_type":"generic",
                "elements":[
                   {
                    "title":title,
                    "subtitle":subtitle,
                    "default_action": {
                      "type": "web_url",
                      "url": url,
                      "webview_height_ratio": "full"
                    },
                    "buttons":[
                        {
                            "type":"postback",
                            "title":"Schválit",
                            "payload":JSON.stringify({
                                method: "APPROVE_DOMAIN",
                                domain: domain.domain,
                                autoCall: autoCall
                            }),
                        },
                        {
                        "type":"postback",
                        "title":"Zamítnout",
                        "payload":JSON.stringify({
                            method: "REJECT_DOMAIN",
                            domain: domain.domain,
                            autoCall: autoCall
                        })
                      }              
                    ]      
                  }
                ]
              }
        }
    })
    }

    
    async sendNextApproval(autoCall : boolean = true){
        const domain = await this.chooseDomainToApprove();
        if(!domain){
            return null;
        }

        await this.sendApprovalMessage(domain,autoCall)
        return true ;
    }

    async askToMoreApproval(){
        return this.messengerService.sendCustomMessage({
            "text":"Chcete schválovat dál?",
            "quick_replies":[
                {
                  "content_type":"text",
                  "title":"Pokračovat",
                  "payload":"",
                  "image_url":"https://cdn-icons-png.flaticon.com/128/8832/8832138.png"
                },{
                  "content_type":"text",
                  "title":"Už ne",
                  "payload":"",
                  "image_url":"https://cdn-icons-png.flaticon.com/512/6276/6276642.png"
                }
              ]
        })
    }

    
    async approveDomain(domain: string){
        const existing = await this.domainRepository.findOne({
            where:{
                domain
            }
        });
        if(!existing) throw new BadRequestException("Domain not found");

        existing.status = GetterDomainStatus.Approved;
        await this.domainRepository.save(existing);

        await this.messengerService.sendMessage(`Doména ${domain} byla schválena.`)
        
    }

    async rejectDomain(domain: string){
        const existing = await this.domainRepository.findOne({
            where:{
                domain
            }
        });
        if(!existing) throw new BadRequestException("Domain not found");

        existing.status = GetterDomainStatus.Rejected;
        await this.domainRepository.save(existing);

        await this.messengerService.sendMessage(`Doména ${domain} byla zamítnuta.`)
    }

    async handlePostback(data: any){
        const payloadString = data.postback.payload;
        const payload = JSON.parse(payloadString);

        switch(payload.method){
            case "APPROVE_DOMAIN":
                await this.approveDomain(payload.domain);
                break;
            case "REJECT_DOMAIN":
                await this.rejectDomain(payload.domain);
                break;
        }

        if(!payload.autoCall){
            await this.askToMoreApproval();
        }
    }

    async handleMessage(data: any){
        const message = data.message.text;
        if(message.toLowerCase().includes("dalsi") 
            || message.toLowerCase().includes("další")
            || message.toLowerCase().includes("pokracovat") 
            || message.toLowerCase().includes("pokračovat")){

            if( ! await this.sendNextApproval(false)){
                await this.messengerService.sendMessage("Zatím nemáme další domény ke schválení. Děkujeme za pomoc.")
            }
        }
    }


}