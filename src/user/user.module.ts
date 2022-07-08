import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { MongooseModule } from "@nestjs/mongoose"
import { User, UserSchema } from "./user.schema"
import { UserService } from "./user.service"
import { MailService } from "src/mail/mail.service"
import { UserController } from "./user.controller"

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])
  ],
  controllers: [UserController],
  providers: [UserService, MailService],
  exports: [UserService, MongooseModule]
})
export class UserModule {}
