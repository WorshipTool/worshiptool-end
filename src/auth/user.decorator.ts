import { ExecutionContext, createParamDecorator } from "@nestjs/common";
import { IUser } from "src/database/interfaces";

export const User = createParamDecorator((data:any, ctx: ExecutionContext) : IUser|null => {
    const request = ctx.switchToHttp().getRequest();
    if(request.user) return request.user;
    return null;
})