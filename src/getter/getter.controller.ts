import { Controller, Get, Post, UnauthorizedException } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AllowNonUser } from "../auth/decorators/allownonuser.decorator";

export let AUTO_GETTER_ACTIVE: boolean = false;

@ApiTags("Getter")
@Controller()
export class GetterController {
    constructor() {}

    @AllowNonUser()
    @Get("getter/isactive")
    async isActive() {
        return AUTO_GETTER_ACTIVE;
    }

    @AllowNonUser()
    @Post("getter/activate")
    async activate() {
        return (AUTO_GETTER_ACTIVE = true);
    }

    @AllowNonUser()
    @Post("getter/deactivate")
    async deactivate() {
        return (AUTO_GETTER_ACTIVE = false);
    }
}
