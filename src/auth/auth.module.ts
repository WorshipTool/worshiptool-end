import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { DatabaseModule } from "../database/database.module";
import { MessengerModule } from "../messenger/messenger.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { secret } from "./jwt/constants";
import { JwtStrategy } from "./jwt/jwt.strategy";
import { UserService } from "./services/user.service";

@Module({
    imports: [
        MessengerModule,
        DatabaseModule,
        PassportModule,
        JwtModule.register({
          secret: secret,
          signOptions: { expiresIn: '2 days' },
        }),
        ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, UserService],
    exports: [AuthService]
})
export class AuthModule{}