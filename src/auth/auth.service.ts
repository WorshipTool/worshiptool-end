import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ILoginQuery, ILoginResult, IUser } from 'src/database/interfaces';
import * as bcrypt from "bcrypt";
import { UserService } from 'src/database/services/user.service';
import { User } from 'src/database/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    // private userService: UserService
  ) {}



  async login(userQuery: ILoginQuery):Promise<ILoginResult> {
    const user : User = null;//await this.userService.findByEmail(userQuery.email);

    if(user==null)return null;

    const passOk = bcrypt.compareSync(userQuery.password, user.password);

    if(passOk)return {user,
      token: this.jwtService.sign(user),
      success: true
    };

    return null   
  }

}