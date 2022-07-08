import { ExecutionContext, Injectable } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"

@Injectable()
export class AuthLocalGuard extends AuthGuard("local") {
  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest()
    const result = (await super.canActivate(context)) as boolean
    await super.logIn(req)
    return result
  }
}
