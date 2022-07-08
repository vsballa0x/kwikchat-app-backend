import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable
} from "@nestjs/common"

@Injectable()
export class OnlyAuthenticatedGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    if (!context.switchToHttp().getRequest().isAuthenticated()) {
      throw new ForbiddenException({
        errors: [{ message: "Forbidden. Not logged in." }]
      })
    }

    return true
  }
}
