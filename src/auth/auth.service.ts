import { Injectable } from "@nestjs/common";
import { UserService } from "./services/user.service";
import { LoginInputData, LoginResult, SignUpInputData, SignUpResult, userToJWTFormat } from "./dtos";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { User } from "src/database/entities/user.entity";
import { RequestResult, codes, messages } from "src/utils/formatted";
import { MessengerService } from "src/messenger/messenger.service";

@Injectable()
export class AuthService{
    constructor(
        private userService: UserService,
        private readonly jwtService: JwtService,
        private messengerService: MessengerService
    ){}

    async login(data: LoginInputData):Promise<LoginResult>{
        const user = await this.userService.findByEmail(data.email);
        if(user==null){
            return{
                user: null,
                token:null
            }
        }

        const same = await bcrypt.compare(data.password, user.password);
        if(!same){
            return{
                user: null,
                token:null
            }
        }

        const token = this.jwtService.sign(userToJWTFormat(user));
        return {
            user,
            token
        }
        
    }

    async signup(data: SignUpInputData) : Promise<RequestResult<any>>{
        const user = await this.userService.findByEmail(data.email);
        if(user!=null){
            return {
                statusCode: codes["Email Already Exists"],
                message: "This email is taken.",
                data: null
            };
        }
        this.userService.addNewUser(data);
        this.messengerService.sendMessage(`Ahoj, do aplikace se právě zaregistroval nový uživatel (${data.firstName} ${data.lastName})`)
        return {
            statusCode: codes.Success,
            message: messages[0],
            data: null
        };
    }

    
}