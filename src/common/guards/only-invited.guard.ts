import { RoomService } from "src/room/room.service"
import { RoomExistsGuard } from "./room-exists.guard"
import { Request } from "express"
import {
  ExecutionContext,
  ForbiddenException,
  Injectable
} from "@nestjs/common"

@Injectable()
export class OnlyInvitedGuard extends RoomExistsGuard {
  constructor(roomService: RoomService) {
    super(roomService)
  }

  async canActivate(context: ExecutionContext) {
    await super.canActivate(context)
    const req: Request = context.switchToHttp().getRequest()
    const userId = req.user._id

    if (
      !req.existingRoom.pendingInvitations.some(
        (member) => member._id === userId
      )
    ) {
      throw new ForbiddenException({
        errors: [{ message: "Forbidden. No pending invitation." }]
      })
    }

    delete req.existingRoom
    return true
  }
}
