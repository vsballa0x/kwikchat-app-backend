import { RoomDocument } from "src/room/room.schema"
import { Document } from "mongoose"
import { User as AppUser } from "src/user/user.schema"

declare global {
  namespace Express {
    interface User extends AppUser, Document {}
    interface Request {
      existingUser?: UserDocument
      existingRoom?: RoomDocument
    }
  }
}

declare module "express-session" {
  interface SessionData {
    verification?: {
      email: string
      otp: string
    }
  }
}
