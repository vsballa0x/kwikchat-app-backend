import {
  mixin,
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  Type
} from "@nestjs/common"
import { Request } from "express"
import { UserService } from "src/user/user.service"

export const UserExistsGuard = (usernameField: string): Type<CanActivate> => {
  @Injectable()
  class UserExistsGuardMixin implements CanActivate {
    constructor(private readonly userService: UserService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const req: Request = context.switchToHttp().getRequest()
      const username: string = req.body[usernameField]

      if (!username) return true

      const user = await this.userService.get({ username })
      if (!user) {
        throw new BadRequestException({
          errors: [
            {
              field: usernameField,
              message: "User with the given username does not exist."
            }
          ]
        })
      }

      req.existingUser = user
      return true
    }
  }

  const guard = mixin(UserExistsGuardMixin)
  return guard
}
