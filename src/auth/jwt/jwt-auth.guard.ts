import { Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { ROLES } from "../../database/entities/user.entity";

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private readonly reflector: Reflector) {
        super();
      }
    
      handleRequest(err, user, info, context) {
        const request = context.switchToHttp().getRequest();       
    
        const allowAny = this.reflector.get<string[]>('allow-non-user', context.getHandler());
        if (user){
          const allowAdmin = this.reflector.get<string[]>('allow-admin', context.getHandler());
          if(allowAdmin && user.role !== ROLES.Admin) throw new UnauthorizedException();
          return user
        };
        if (allowAny) return false;
        throw new UnauthorizedException();
      }
}