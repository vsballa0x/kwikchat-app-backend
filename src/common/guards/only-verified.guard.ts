import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable
} from "@nestjs/common"
import { Request } from "express"

@Injectable()
export class OnlyVerifiedGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const req: Request = context.switchToHttp().getRequest()

    if (!req.user) {
      throw new Error("OnlyVerifiedGuard used without OnlyAuthenticatedGuard.")
    } else if (!req.user.verified) {
      throw new ForbiddenException({
        errors: [{ message: "Forbidden. Not verified." }]
      })
    }

    return true
  }
}
