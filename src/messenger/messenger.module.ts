import { Module } from "@nestjs/common";
import { MessengerService } from "./messenger.service";
import { HttpModule } from "@nestjs/axios";

@Module({
    imports:[
        HttpModule
    ],
    providers: [
        MessengerService
    ],
    exports: [
        MessengerService
    ]
})
export class MessengerModule{}