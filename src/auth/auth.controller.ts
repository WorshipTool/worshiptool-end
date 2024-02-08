import { BadRequestException, Body, Controller, Post, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { JwtResult, LoginInputData, LoginResult, PostGoogleLoginBody, SignUpInputData } from "./auth.dto";
import { AllowNonUser } from "./decorators/allownonuser.decorator";
import { ApiBadRequestResponse, ApiConflictResponse, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";

@ApiTags("Auth")
@Controller("auth")
export class AuthController{
    constructor(
        private authService: AuthService
    ){}
    

    /**
     * The function allows the user to log in using email and password.
     * @param {LoginInputData} data - The parameter `data` is of type `LoginInputData`.
     * @returns A formatted response containing the login result.
     */
    @ApiOperation({summary: "Logs in the user using email and password."})
    @ApiUnauthorizedResponse({
        description: "Wrong email or password."
    })
    @AllowNonUser()
    @Post("login")
    async login(@Body() data: LoginInputData) : Promise<LoginResult>{
        const result : LoginResult = await this.authService.login(data);
        if(result.user==null)
            throw new UnauthorizedException("Wrong email or password."); 
        return result;
    }


    /**
     * The function allows the user to sign up using email and password.
     * @param {SignUpInputData} data - The parameter `data` is of type `SignUpInputData`.
     * @returns A formatted response containing the signup result.
     */
    @ApiOperation({summary: "Signs up the user using email and password."})
    @ApiConflictResponse({
        description: "Email already exists."
    })
    @AllowNonUser()
    @Post("signup")
    signup(@Body() data: SignUpInputData){
        const result = this.authService.signup(data); 
        return result;
    }


    /**
     * The function allows the user to sign up or log in using Google.
     * If the email is already registered, the google account is linked to the existing account.
     * @param {PostGoogleLoginBody} data - The parameter `data` is of type `PostGoogleLoginBody`.
     * @returns A formatted response containing the signup or login result.
     */
    @ApiOperation({summary: "Signs up or logs in the user using Google."})
    @ApiBadRequestResponse({
        description: "Some user data not provided."
    })
    @AllowNonUser()
    @Post("signup/google")
    async signupWithGoogle(@Body() data: PostGoogleLoginBody){
        return this.loginWithGoogle(data);
    }


    /**
     * The function allows the user to log in using Google.
     * @param {PostGoogleLoginBody} data - The parameter `data` is of type `PostGoogleLoginBody`.
     * @returns A formatted response containing the login result.
     */
    @ApiOperation({summary: "Logs in the user using Google."})
    @ApiBadRequestResponse({
        description: "Some user data not provided."
    })
    @AllowNonUser()
    @Post("login/google")
    async loginWithGoogle(@Body() data: PostGoogleLoginBody) : Promise<JwtResult>{
        if(data.userToken == null)
            throw new BadRequestException("No user token provided.");

        if(data.email == null || data.firstName == null || data.lastName == null)
            throw new BadRequestException("Some user data not provided.");

        const result = await this.authService.loginWithGoogle(data);
        return result;
    }

    

}