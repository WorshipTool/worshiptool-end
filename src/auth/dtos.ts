import { User } from "src/database/entities/user.entity"

export interface LoginInputData{
    email:string,
    password: string
}

export interface LoginResult{
    user: User,
    token: string
}

export interface SignUpInputData{
    firstName: string,
    lastName: string,
    email:string,
    password:string
}

export interface SignUpResult{
    success: boolean,
    message: string
}

export function userToJWTFormat(user: User){
    return {
        guid: user.guid,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
    }
}