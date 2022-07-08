import { BadRequestException, Injectable } from "@nestjs/common"
import { RoomDocument } from "src/room/room.schema"
import { Types } from "mongoose"
import { RoomService } from "src/room/room.service"
import { UserDocument } from "src/user/user.schema"

@Injectable()
export class MessageService {
  constructor(private readonly roomService: RoomService) {}

  async createMessage(
    room: RoomDocument,
    message: { content: string; from: Types.ObjectId; inReplyTo?: string }
  ) {
    const { content, inReplyTo, from } = message
    if (
      inReplyTo != null &&
      !room.messages.some((message) => message._id.toString() === inReplyTo)
    ) {
      throw new BadRequestException({
        errors: [{ field: "inReplyTo", message: "Message does not exist." }]
      })
    }

    const messageId = new Types.ObjectId()
    const inReplyToId =
      inReplyTo != null ? new Types.ObjectId(inReplyTo) : undefined

    const result = await this.roomService.update(
      { _id: room._id },
      {
        $push: {
          messages: {
            _id: messageId,
            type: "user",
            from,
            content,
            inReplyTo: inReplyToId
          }
        }
      }
    )

    return result.messages.find(
      (message) => message._id.toString() === messageId._id.toString()
    )
  }

  async updateMessage(
    room: RoomDocument,
    messageId: string,
    loggedInUser: UserDocument,
    content?: string
  ) {
    const message = room.messages.find(
      (message) => message._id.toString() === messageId
    )

    let errMessage: string

    if (!message) {
      errMessage = "Message does not exist."
    } else if (message.type !== "user") {
      errMessage = "Cannot edit a system generated message."
    } else if (message.from._id.toString() !== loggedInUser.id) {
      if (content != null) {
        errMessage = "Cannot edit a message sent by others."
      } else if (room.owner._id.toString() !== loggedInUser.id) {
        errMessage = "Cannot delete a message sent by others."
      }
    } else if (!message.content) {
      errMessage = "Cannot update an already deleted message."
    }

    if (errMessage) {
      throw new BadRequestException({
        errors: [{ field: "messageId", message: errMessage }]
      })
    }

    const unsetOp =
      content != null ? {} : { $unset: { "messages.$.content": true } }

    const setOp =
      content != null
        ? {
            $set: {
              "messages.$.content": content,
              "messages.$.updatedAt": Date.now()
            }
          }
        : { $set: { "messages.$.updatedAt": Date.now() } }

    const result = await this.roomService.update(
      { _id: room._id, "messages._id": new Types.ObjectId(messageId) },
      { ...unsetOp, ...setOp }
    )

    return result.messages.find(
      (message) => message._id.toString() === messageId
    )
  }
}
