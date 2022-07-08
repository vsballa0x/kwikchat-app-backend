import {
  Body,
  Controller,
  Session,
  Post,
  Logger,
  UseGuards,
  InternalServerErrorException,
  UseFilters,
  Req,
  Res
} from "@nestjs/common"

import { Request, Response } from "express"
import { Session as ExpressSession, SessionData } from "express-session"
import { MongoExceptionFilter } from "src/common/filters/mongo-exception.filter"
import { AuthLocalGuard } from "src/common/guards/auth-local.guard"
import { CustomThrottlerGuard } from "src/common/guards/custom-throttler.guard"
import { OnlyAuthenticatedGuard } from "src/common/guards/only-authenticated.guard"
import { FieldType, ValidationGuard } from "src/common/guards/validation.guard"
import { VerificationGuard } from "src/common/guards/verification.guard"
import { UserService } from "./user.service"

@Controller("api/v1/user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseFilters(MongoExceptionFilter)
  @UseGuards(
    ValidationGuard({
      email: { type: FieldType.Email, required: true },
      username: { type: FieldType.Username, required: true },
      password: { type: FieldType.Password, required: true }
    })
  )
  @Post("register")
  async registerUser(
    @Body("email") email: string,
    @Body("username") username: string,
    @Body("password") password: string,
    @Session() session: ExpressSession & SessionData
  ) {
    const createdUser = await this.userService.registerUser(
      email,
      username,
      password,
      session
    )

    return {
      data: {
        user: {
          email: createdUser.email,
          username: createdUser.username
        }
      }
    }
  }

  // TODO: Add filter to handle errors.
  @UseGuards(VerificationGuard, CustomThrottlerGuard)
  @Post("register/resend-otp")
  async resendOtp(@Session() session: ExpressSession & SessionData) {
    await this.userService.resendOtp(session)
    return
  }

  // TODO: Add filter to handle errors.
  @UseGuards(
    ValidationGuard({ otp: { type: FieldType.OTP, required: true } }),
    VerificationGuard
  )
  @Post("register/verify-otp")
  async verifyOtp(
    @Body("otp") otp: string,
    @Session() session: ExpressSession & SessionData
  ) {
    await this.userService.verifyOtp(otp, session)
    return
  }

  @UseGuards(
    ValidationGuard({
      username: { type: FieldType.Username, required: true },
      password: { type: FieldType.Password, required: true },
      rememberMe: { type: FieldType.Boolean, required: true }
    }),
    AuthLocalGuard
  )
  @Post("login")
  async logIn(
    @Body("rememberMe") rememberMe: boolean,
    @Session() session: ExpressSession & SessionData
  ) {
    if (rememberMe) session.cookie.maxAge = 604_800_000
    return
  }

  @UseGuards(OnlyAuthenticatedGuard)
  @Post("logout")
  async logOut(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    res.clearCookie("connect.sid")
    req.logOut((err) => {
      if (err) {
        Logger.error(err)
        throw new InternalServerErrorException({
          errors: [{ message: "Internal server error." }]
        })
      }
    })
    return
  }

  // TODO: Implement `/api/v1/user/update` endpoint.
  // TODO: Implement `/api/v1/user/forgot-password` endpoint.
}
