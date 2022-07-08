import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable
} from "@nestjs/common"
import { Request } from "express"
import { RoomService } from "src/room/room.service"

@Injectable()
export class RoomExistsGuard implements CanActivate {
  constructor(private readonly roomService: RoomService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest()
    const { roomId } = req.body

    if (!req.user) {
      throw new Error("RoomExistsGuard used without OnlyAuthenticatedGuard.")
    }

    const room = await this.roomService.get(roomId)
    if (!room) {
      throw new BadRequestException({
        errors: [
          { field: "roomId", message: "Room with the given ID does not exist." }
        ]
      })
    }

    req.existingRoom = room
    return true
  }
}
