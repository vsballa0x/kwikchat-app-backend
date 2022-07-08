import { Module } from "@nestjs/common"
import { RoomModule } from "src/room/room.module"
import { MessageController } from "./message.controller"
import { MessageService } from "./message.service"

@Module({
  imports: [RoomModule],
  controllers: [MessageController],
  providers: [MessageService]
})
export class MessageModule {}
