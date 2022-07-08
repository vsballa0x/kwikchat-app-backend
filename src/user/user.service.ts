import { Injectable, BadRequestException } from "@nestjs/common"
import { RequireExactlyOne, RequireAtLeastOne } from "type-fest"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { User, UserDocument } from "./user.schema"
import { MailService } from "src/mail/mail.service"
import { Session, SessionData } from "express-session"

export type UserFilter = RequireExactlyOne<{
  _id: string
  email: string
  username: string
}>

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly mailService: MailService
  ) {}

  async registerUser(
    email: string,
    username: string,
    password: string,
    session: Session & SessionData
  ): Promise<UserDocument> {
    const newUser = await this.create(email, username, password, false)
    const otp = this.mailService.generateOtp(6)
    await this.mailService.sendOtpMail(email, otp)

    session.verification = {
      otp,
      email
    }

    return newUser
  }

  async resendOtp(session: Session & SessionData) {
    return this.mailService.sendOtpMail(
      session.verification.email,
      session.verification.otp
    )
  }

  async verifyOtp(otp: string, session: Session & SessionData) {
    if (session.verification.otp === otp) {
      await this.update(
        { email: session.verification.email },
        { verified: true }
      )
      delete session.verification
    } else {
      throw new BadRequestException({
        errors: [{ field: "otp", message: "Incorrect OTP." }]
      })
    }
  }

  // Basic Operations - Intended to keep the code clean.

  async get(filter: UserFilter): Promise<UserDocument | null> {
    return this.userModel.findOne(filter).exec()
  }

  async create(
    email: string,
    username: string,
    password: string,
    verified: boolean
  ): Promise<UserDocument> {
    return new this.userModel({ email, username, password, verified }).save()
  }

  async update(
    filter: UserFilter,
    update: RequireAtLeastOne<User>
  ): Promise<UserDocument> {
    return this.userModel.findOneAndUpdate(filter, update).exec()
  }

  async delete(filter: UserFilter): Promise<UserDocument> {
    return this.userModel.findOneAndDelete(filter).exec()
  }
}
