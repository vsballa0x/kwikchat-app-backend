import * as sendgrid from "@sendgrid/mail"
import { randomInt } from "crypto"
import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { MailDataRequired } from "@sendgrid/mail"

@Injectable()
export class MailService {
  constructor(private readonly configService: ConfigService) {
    sendgrid.setApiKey(this.configService.get("SENDGRID_API_KEY"))
  }

  generateOtp(length: number) {
    let otp = String()
    for (let i = 0; i < length; i++) {
      otp += randomInt(0, 9)
    }
    return otp
  }

  async send(data: MailDataRequired) {
    return sendgrid.send(data)
  }

  async sendOtpMail(to: string, otp: string) {
    return this.send({
      to,
      from: "verify@kwikchat.app",
      subject: "Kwikchat OTP verification",
      text: `Enter this OTP to verify your email on Kwikchat app: ${otp}`
    })
  }
}
