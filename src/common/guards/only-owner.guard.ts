import { Request } from "express"
import { RoomService } from "src/room/room.service"
import { RoomExistsGuard } from "./room-exists.guard"

import {
  ExecutionContext,
  ForbiddenException,
  Injectable
} from "@nestjs/common"

@Injectable()
export class OnlyOwnerGuard extends RoomExistsGuard {
  constructor(roomService: RoomService) {
    super(roomService)
  }

  async canActivate(context: ExecutionContext) {
    await super.canActivate(context)
    const req: Request = context.switchToHttp().getRequest()

    if (req.existingRoom.owner._id.toString() !== req.user.id) {
      throw new ForbiddenException({
        errors: [{ message: "Forbidden. You are not the owner." }]
      })
    }

    return true
  }
}
