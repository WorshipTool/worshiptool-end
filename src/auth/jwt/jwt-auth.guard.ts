import { Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private readonly reflector: Reflector) {
        super();
      }
    
      handleRequest(err, user, info, context) {
        const request = context.switchToHttp().getRequest();       
    
        const allowAny = this.reflector.get<string[]>('allow-non-user', context.getHandler());
        if (user) return user;
        if (allowAny) return false;
        throw new UnauthorizedException();
      }
}