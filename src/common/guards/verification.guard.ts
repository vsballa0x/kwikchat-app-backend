import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable
} from "@nestjs/common"
import { Request } from "express"

@Injectable()
export class VerificationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req: Request = context.switchToHttp().getRequest()
    if (req.session.verification == null) {
      throw new ForbiddenException({
        errors: [{ message: "Forbidden. No verification data available." }]
      })
    }
    return true
  }
}
