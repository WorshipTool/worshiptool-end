import { Inject, Injectable } from "@nestjs/common";
import { USER_REPOSITORY } from "src/database/constants";
import { ROLES, User } from "src/database/entities/user.entity";
import { Repository } from "typeorm";
import { SignUpInputData } from "../dtos";
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
        console.log("data:",data)
        const hash = bcrypt.hashSync(data.password, saltRounds)
        const body : User = {
            ...data,
            password: hash,
            role: ROLES.User,
            guid: undefined,
            variants: [],
            playlists:[],
            groups:[]
        }
        await this.userRepository.createQueryBuilder()
            .insert().values(body).execute();

        
    }
}