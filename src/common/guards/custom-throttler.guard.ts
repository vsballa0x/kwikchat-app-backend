import { HttpException, HttpStatus, Injectable } from "@nestjs/common"
import { ThrottlerGuard } from "@nestjs/throttler"

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected throwThrottlingException(): void {
    throw new HttpException(
      { errors: [{ message: "Too many requests." }] },
      HttpStatus.TOO_MANY_REQUESTS
    )
  }
}
