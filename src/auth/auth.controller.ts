import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginInputData, SignUpInputData } from "./dtos";
import { codes, formatted, messages } from "src/utils/formatted";
import { AllowNonUser } from "./decorators/allownonuser.decorator";

@Controller("auth")
export class AuthController{
    constructor(
        private authService: AuthService
    ){}

    @AllowNonUser()
    @Post("login")
    async login(@Body() data: LoginInputData){
        const result = await this.authService.login(data);
        return formatted(result, 
            result.user==null?codes["Unknown Error"]:codes["Success"],
            result.user==null?"Wrong email or password.":messages["Success"])
    }

    @AllowNonUser()
    @Post("signup")
    signup(@Body() data: SignUpInputData){
        console.log(data)
        const result = this.authService.signup(data); 
        return result;
    }

    

}