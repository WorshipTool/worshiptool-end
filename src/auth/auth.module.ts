import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { UserService } from "./services/user.service";
import { DatabaseModule } from "src/database/database.module";
import { AuthService } from "./auth.service";

@Module({
    imports: [DatabaseModule],
    controllers: [AuthController],
    providers: [AuthService]
})
export class AuthModule{}