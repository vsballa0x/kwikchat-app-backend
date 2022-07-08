import { Controller, Body, Post, Req, UseGuards } from "@nestjs/common"
import { OnlyAuthenticatedGuard } from "src/common/guards/only-authenticated.guard"
import { FieldType, ValidationGuard } from "src/common/guards/validation.guard"
import { Request } from "express"
import { RoomService } from "./room.service"
import { OnlyOwnerGuard } from "src/common/guards/only-owner.guard"
import { UserExistsGuard } from "src/common/guards/user-exists.guard"
import { OnlyVerifiedGuard } from "src/common/guards/only-verified.guard"
import { OnlyInvitedGuard } from "src/common/guards/only-invited.guard"

@UseGuards(OnlyAuthenticatedGuard, OnlyVerifiedGuard)
@Controller("api/v1/room")
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  // TODO: Add filter to handle errors.
  @UseGuards(
    ValidationGuard({ title: { type: FieldType.RoomTitle, required: true } })
  )
  @Post("create")
  async createRoom(@Body("title") title: string, @Req() req: Request) {
    const result = await this.roomService.createRoom(title, req.user)
    return {
      data: { room: result }
    }
  }

  // TODO: Add filter to handle errors.
  @UseGuards(
    ValidationGuard({
      roomId: { type: FieldType.ObjectId, required: true },
      title: { type: FieldType.RoomTitle, required: false },
      newOwnerUsername: { type: FieldType.Username, required: false }
    }),
    OnlyOwnerGuard,
    UserExistsGuard("newOwnerUsername")
  )
  @Post("update")
  async updateRoom(@Body("title") title: string, @Req() req: Request) {
    const room = req.existingRoom
    const newOwner = req.existingUser

    if (newOwner) delete req.existingUser
    delete req.existingRoom

    const result = await this.roomService.updateRoom(room, req.user, {
      newTitle: title,
      newOwner
    })

    return {
      data: { room: result }
    }
  }

  // TODO: Add filter to handle errors.
  @UseGuards(
    ValidationGuard({ roomId: { type: FieldType.ObjectId, required: true } }),
    OnlyOwnerGuard
  )
  @Post("delete")
  async deleteRoom(@Body("roomId") id: string, @Req() req: Request) {
    delete req.existingRoom
    await this.roomService.delete(id)
    return
  }

  @UseGuards(
    ValidationGuard({
      roomId: { type: FieldType.ObjectId, required: true },
      username: { type: FieldType.Username, required: true }
    }),
    OnlyOwnerGuard,
    UserExistsGuard("username")
  )
  @Post("invite")
  async inviteUser(@Req() req: Request) {
    const room = req.existingRoom
    const invitedUser = req.existingUser

    delete req.existingRoom
    delete req.existingUser

    const result = await this.roomService.inviteUser(
      room,
      req.user,
      invitedUser
    )
    return { data: { room: result } }
  }

  @UseGuards(
    ValidationGuard({ roomId: { type: FieldType.ObjectId, required: true } }),
    OnlyInvitedGuard
  )
  @Post("invite/accept")
  async acceptInvitation(@Body("roomId") id: string, @Req() req: Request) {
    const result = await this.roomService.acceptInvitation(id, req.user)
    return {
      data: { room: result }
    }
  }

  @UseGuards(
    ValidationGuard({ roomId: { type: FieldType.ObjectId, required: true } }),
    OnlyInvitedGuard
  )
  @Post("invite/reject")
  async rejectInvitation(@Body("roomId") id: string, @Req() req: Request) {
    const result = await this.roomService.rejectInvitation(id, req.user)
    return {
      data: { room: result }
    }
  }
}
