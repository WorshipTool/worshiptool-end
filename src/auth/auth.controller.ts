import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginInputData, SignUpInputData } from "./dtos";
import { codes, formatted } from "src/utils/formatted";

@Controller("auth")
export class AuthController{
    constructor(
        private authService: AuthService
    ){}

    @Post("login")
    login(@Body() data: LoginInputData){
        const result = this.authService.login(data);
        return formatted(result, 
            result.user==null?codes["Unknown Error"]:codes["Success"])
    }

    @Post("signup")
    signup(@Body() data: SignUpInputData){
        const result = this.authService.signup(data); 
        return formatted(null,
            result.success?codes["Success"]:codes["Unknown Error"],
            result.message)
    }

}