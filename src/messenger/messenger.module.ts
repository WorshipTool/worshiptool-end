import { Module } from "@nestjs/common";
import { MessengerService } from "./messenger.service";
import { HttpModule } from "@nestjs/axios";
import { MessengerController } from "./messenger.controller";

@Module({
    imports:[
        HttpModule
    ],
    providers: [
        MessengerService
    ],
    controllers: [
        MessengerController
    ],
    exports: [
        MessengerService
    ]
})
export class MessengerModule{}