import { Inject, Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { USER_REPOSITORY } from "../../database/constants";
import { User, ROLES, LOGIN_TYPE } from "../../database/entities/user.entity";
import { SignUpInputData, PostGoogleLoginBody } from "../auth.dto";
import * as bcrypt from "bcrypt"
import { saltRounds } from "../constants";

@Injectable()
export class UserService{
    constructor(
        @Inject(USER_REPOSITORY)
        private userRepository: Repository<User>
    ){}

    async findByEmail(email:string):Promise<User>{
        const result = await this.userRepository.createQueryBuilder()
            .where("email=:email",{email}).getOne();

        return result;
    }

    async addNewUser(data: SignUpInputData){
        const hash = bcrypt.hashSync(data.password, saltRounds)
        const body : User = {
            ...data,
            password: hash,
            role: ROLES.User,
            guid: undefined,
            variants: [],
            playlists:[],
            groups:[],
            loginType: LOGIN_TYPE.Email,
            googleId: null
        }
        await this.userRepository.createQueryBuilder()
            .insert().values(body).execute();

        
    }

    async loginOrSignupWithGoogle(data: PostGoogleLoginBody) : Promise<{user:User, justCreated: boolean, googlefirst: boolean}>{

        const user = await this.userRepository.findOne({where:{
            email: data.email
        }});

        if(user){
            if(user.loginType===LOGIN_TYPE.Google)
                return {
                    user,
                    justCreated: false,
                    googlefirst: false
                }
            else{
                await this.userRepository.update(user.guid, {
                    loginType: LOGIN_TYPE.Google,
                    googleId: data.userToken
                })
                return {
                    user: await this.userRepository.findOne({
                        where:{
                            guid: user.guid
                        }
                    }),
                    justCreated: false,
                    googlefirst: true
                }
            }
        }

        
        const body : User = {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            password: null,
            role: ROLES.User,
            guid: undefined,
            variants: [],
            playlists:[],
            groups:[],
            loginType: LOGIN_TYPE.Google,
            googleId: data.userToken
        }
        await this.userRepository.createQueryBuilder()
            .insert().values(body).execute();

        return {
            user: await this.userRepository.findOne({where:{
                googleId: data.userToken
            }}),
            justCreated: true,
            googlefirst: true
        }
    }
}