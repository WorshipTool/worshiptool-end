import { PickType } from "@nestjs/swagger"
import { User } from "../database/entities/user.entity"

export class LoginInputData{
    email:string
    password: string
}

export class LoginResult{
    user: LoginUserItemResult
    token: string
}
export class JwtResult{
    user: LoginUserItemResult
    token: string
}

export class PostGoogleLoginBody{
    userToken: string
    email: string
    firstName: string
    lastName: string
}

export class SignUpInputData{
    firstName: string
    lastName: string
    email:string
    password:string
}

export class SignUpResult{
    success: boolean
    message: string
}

export class LoginUserItemResult extends PickType(User, [
    "guid",
    "firstName",
    "lastName",
    "email",
    "role"
] as const) {}

export function userToJWTFormat(user: User){
    return {
        guid: user.guid,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
    }
}