import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginInputData, PostGoogleLoginBody, SignUpInputData } from "./dtos";
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
        const result = this.authService.signup(data); 
        return result;
    }

    @AllowNonUser()
    @Post("signup/google")
    async signupWithGoogle(@Body() data: PostGoogleLoginBody){
        return this.loginWithGoogle(data);
    }

    @AllowNonUser()
    @Post("login/google")
    async loginWithGoogle(@Body() data: PostGoogleLoginBody){
        if(data.userToken == null)
            return formatted(null, codes["Unknown Error"], "No user token provided.");

        if(data.email == null || data.firstName == null || data.lastName == null)
            return formatted(null, codes["Unknown Error"], "Some user data not provided.");

        const result = await this.authService.loginWithGoogle(data);
        return result;
    }

    

}