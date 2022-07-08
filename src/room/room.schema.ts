import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Types, Document } from "mongoose"
import { Message, MessageSchema } from "src/message/message.schema"

export type RoomDocument = Room & Document

@Schema()
export class Room {
  @Prop({ required: true })
  title: string

  @Prop({ required: true, ref: "User" })
  owner: Types.ObjectId

  @Prop({ type: [{ type: Types.ObjectId, ref: "User" }], required: true })
  members: Types.ObjectId[]

  @Prop({ type: [{ type: Types.ObjectId, ref: "User" }] })
  pendingInvitations?: Types.ObjectId[]

  @Prop([MessageSchema])
  messages: Message[]
}

export const RoomSchema = SchemaFactory.createForClass(Room)
