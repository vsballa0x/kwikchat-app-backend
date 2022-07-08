import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Types, Document } from "mongoose"

export type MessageDocument = Message & Document

@Schema()
export class Message {
  _id?: Types.ObjectId

  @Prop({ required: true, enum: ["system", "user"] })
  type: string

  @Prop({ required: true })
  content?: string

  @Prop({ ref: "User" })
  from?: Types.ObjectId

  @Prop()
  inReplyTo?: Types.ObjectId

  @Prop({ default: Date.now() })
  createdAt?: Date

  @Prop({ default: Date.now() })
  updatedAt?: Date
}

export const MessageSchema = SchemaFactory.createForClass(Message)
