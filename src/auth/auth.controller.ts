import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { IAllSongData, ISongGetQuery, INewSongData, ISongDataArray, ISongGetResult, ILoginQuery, ILoginResult, IUser } from '../database/interfaces';
import { SongService } from '../database/services/song.service';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { RequestResult, codes, makeResult, makeSuccessResult, messages } from 'src/utils/queryResultConverter';

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService
    ) {}


  @Get()
  getTest(): string{
    return "This is Auth page.";
  }

  @Post("login")
  getAuthentication(@Body() body: ILoginQuery) : RequestResult<ILoginResult>{
    
    if(body.email=="pe.pavlin@gmail.com"&&body.password=="semice"){
        const user : IUser = {
          name: "Petr Pavlín",
          isAdmin: true
        }
        const token = this.jwtService.sign(user);

        return makeSuccessResult({
            success: true,
            user,
            token
        });
    }
    

    return makeResult(codes[50], messages[50],{
        success: false,
        user: null,
        token: null
    })

  }

}
