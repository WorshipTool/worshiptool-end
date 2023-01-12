import { ExecutionContext, createParamDecorator } from "@nestjs/common";
import { User as UserI} from "src/database/entities/user.entity";

export const User = createParamDecorator((data:any, ctx: ExecutionContext) : UserI|null => {
    const request = ctx.switchToHttp().getRequest();
    if(request.user) return request.user;
    return null;
})