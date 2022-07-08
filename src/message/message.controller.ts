import { Controller, UseGuards, Body, Post, Req } from "@nestjs/common"
import { OnlyAuthenticatedGuard } from "src/common/guards/only-authenticated.guard"
import { OnlyVerifiedGuard } from "src/common/guards/only-verified.guard"
import { RoomExistsGuard } from "src/common/guards/room-exists.guard"
import { FieldType, ValidationGuard } from "src/common/guards/validation.guard"
import { Request } from "express"
import { MessageService } from "./message.service"

@UseGuards(OnlyAuthenticatedGuard, OnlyVerifiedGuard)
@Controller("api/v1/message")
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @UseGuards(
    ValidationGuard({
      roomId: { type: FieldType.ObjectId, required: true },
      content: { type: FieldType.MessageContent, required: true },
      inReplyTo: { type: FieldType.ObjectId, required: false }
    }),
    RoomExistsGuard
  )
  @Post("create")
  async createMessage(
    @Body("content") content: string,
    @Body("inReplyTo") inReplyTo: string,
    @Req() req: Request
  ) {
    const room = req.existingRoom
    delete req.existingRoom

    const message = await this.messageService.createMessage(room, {
      content,
      inReplyTo,
      from: req.user._id
    })
    return { data: { message } }
  }

  @UseGuards(
    ValidationGuard({
      roomId: { type: FieldType.ObjectId, required: true },
      messageId: { type: FieldType.ObjectId, required: true },
      content: { type: FieldType.MessageContent, required: false }
    }),
    RoomExistsGuard
  )
  @Post("update")
  async updateMessage(
    @Body("messageId") messageId: string,
    @Body("content") content: string,
    @Req() req: Request
  ) {
    const room = req.existingRoom
    delete req.existingRoom

    const message = await this.messageService.updateMessage(
      room,
      messageId,
      req.user,
      content
    )
    return { data: { message } }
  }
}
