import * as bcrypt from "bcrypt"
import { Injectable } from "@nestjs/common"
import { UserService } from "src/user/user.service"
import { UnauthorizedException } from "@nestjs/common"

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async validateUser(username: string, password: string) {
    const user = await this.userService.get({ username })

    if (!user || !bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException({
        errors: [{ message: "Invalid username and password combination." }]
      })
    }

    return user
  }
}
