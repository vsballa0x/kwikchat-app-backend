import { Module } from "@nestjs/common"
import { PassportModule } from "@nestjs/passport"
import { UserModule } from "src/user/user.module"
import { AuthService } from "./auth.service"
import { LocalStrategy } from "./local.strategy"
import { SerializerService } from "./serializer.service"

@Module({
  imports: [UserModule, PassportModule],
  providers: [AuthService, LocalStrategy, SerializerService]
})
export class AuthModule {}
