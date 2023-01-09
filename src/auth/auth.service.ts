import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ILoginQuery, IUser } from 'src/database/interfaces';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    return null;
  }

  async login(user: ILoginQuery) {
    const userData : IUser = {
      name: "alksdjflkasd",
      isAdmin: false
    }
    return {
      access_token: this.jwtService.sign(userData),
    };
  }
}