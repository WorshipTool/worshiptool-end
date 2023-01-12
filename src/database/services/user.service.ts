import { Inject, Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import {  USER_REPOSITORY } from "../constants";
import { User } from "../entities/user.entity";

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private usersRepository: Repository<User>,
  ) {}

  async findByEmail(email:string) : Promise<User> {
    const user = await this.usersRepository.createQueryBuilder()
    .where("email= :email", {email}).getOne();



    return user;
  }

}