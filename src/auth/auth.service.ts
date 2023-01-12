import { Injectable } from "@nestjs/common";
import { UserService } from "./services/user.service";
import { LoginInputData, LoginResult, SignUpInputData, SignUpResult } from "./dtos";

@Injectable()
export class AuthService{
    constructor(
        private userService: UserService
    ){}

    login(data: LoginInputData):LoginResult{
        return{
            user: null,
            token:null
        }
    }

    signup(data: SignUpInputData) : SignUpResult{
        return {
            success: false,
            message: "The signup function is unavailable right now."
        };
    }
}