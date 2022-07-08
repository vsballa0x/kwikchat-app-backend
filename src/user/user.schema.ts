import * as bcrypt from "bcrypt"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document } from "mongoose"

export type UserDocument = User & Document

@Schema({ timestamps: true, strict: false })
export class User {
  @Prop({ unique: true, lowercase: true, required: true })
  email: string

  @Prop({ unique: true, required: true })
  username: string

  @Prop({ required: true })
  password: string

  // Not a user submitted field. So, no schema.
  verified: boolean

  createdAt?: Date
  updatedAt?: Date
}

export const UserSchema = SchemaFactory.createForClass(User)

UserSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next()
  this.password = bcrypt.hashSync(this.password, 12)
  next()
})
