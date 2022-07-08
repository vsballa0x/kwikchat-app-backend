import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { UserModule } from "src/user/user.module"
import { RoomController } from "./room.controller"
import { Room, RoomSchema } from "./room.schema"
import { RoomService } from "./room.service"

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Room.name, schema: RoomSchema }]),
    UserModule
  ],
  controllers: [RoomController],
  providers: [RoomService],
  exports: [RoomService, MongooseModule]
})
export class RoomModule {}
