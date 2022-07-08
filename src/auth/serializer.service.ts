import { Injectable } from "@nestjs/common"
import { PassportSerializer } from "@nestjs/passport"
import { UserDocument } from "src/user/user.schema"
import { UserService } from "src/user/user.service"

@Injectable()
export class SerializerService extends PassportSerializer {
  constructor(private readonly userService: UserService) {
    super()
  }

  serializeUser(
    user: UserDocument,
    done: (err: Error, user: { id: string }) => void
  ) {
    done(null, { id: user.id })
  }

  async deserializeUser(
    payload: { id: string },
    done: (err: Error, user: UserDocument) => void
  ) {
    done(null, await this.userService.get({ _id: payload.id }))
  }
}
