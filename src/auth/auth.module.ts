import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { UserService } from "./services/user.service";
import { DatabaseModule } from "src/database/database.module";
import { AuthService } from "./auth.service";
import { JwtModule, JwtService } from "@nestjs/jwt/dist";
import { PassportModule } from "@nestjs/passport";
import { secret } from "./jwt/constants";
import { JwtStrategy } from "./jwt/jwt.strategy";

@Module({
    imports: [
        DatabaseModule,
        PassportModule,
        JwtModule.register({
          secret: secret,
          signOptions: { expiresIn: '60s' },
        }),],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy]
})
export class AuthModule{}