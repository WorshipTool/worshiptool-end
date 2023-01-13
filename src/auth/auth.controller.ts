import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginInputData, SignUpInputData } from "./dtos";
import { codes, formatted, messages } from "src/utils/formatted";

@Controller("auth")
export class AuthController{
    constructor(
        private authService: AuthService
    ){}

    @Post("login")
    async login(@Body() data: LoginInputData){
        const result = await this.authService.login(data);
        return formatted(result, 
            result.user==null?codes["Unknown Error"]:codes["Success"],
            result.user==null?"Wrong email or password.":messages["Success"])
    }

    @Post("signup")
    signup(@Body() data: SignUpInputData){
        const result = this.authService.signup(data); 
        return result;
    }

    

}