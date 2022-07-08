import { Injectable, BadRequestException } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { FilterQuery, Model, UpdateQuery } from "mongoose"
import { User, UserDocument } from "src/user/user.schema"
import { Room, RoomDocument } from "./room.schema"

async function getSafeRoomObject(room: RoomDocument) {
  const result = await room.populate<{ members: User[]; owner: User }>([
    "members",
    "owner"
  ])

  return {
    id: result.id,
    title: result.title,
    messages: result.messages,
    owner: result.owner.username,
    members: result.members.reduce((usernames: string[], user: User) => {
      usernames.push(user.username)
      return usernames
    }, [])
  }
}

@Injectable()
export class RoomService {
  constructor(
    @InjectModel(Room.name) private readonly roomModel: Model<Room>
  ) {}

  async createRoom(title: string, owner: UserDocument) {
    return getSafeRoomObject(await this.create(title, owner))
  }

  async updateRoom(
    room: RoomDocument,
    currentOwner: UserDocument,
    update: { newTitle?: string; newOwner?: UserDocument }
  ) {
    const { newTitle, newOwner } = update

    const titleChangeMsg =
      newTitle != null
        ? {
            $push: {
              messages: {
                type: "system",
                content: `${currentOwner.username} changed the title to "${newTitle}"`
              }
            }
          }
        : null

    const ownerChangeMsg =
      newOwner != null
        ? {
            $push: {
              messages: {
                type: "system",
                content: `${newOwner.username} is now the owner`
              }
            }
          }
        : null

    if (newOwner != null) {
      if (newOwner.id === currentOwner.id) {
        throw new BadRequestException({
          errors: [
            {
              field: "newOwnerUsername",
              message: "User is already the owner of this room."
            }
          ]
        })
      } else if (
        !room.members.some((member) => member._id.toString() === newOwner.id)
      ) {
        throw new BadRequestException({
          errors: [
            {
              field: "newOwnerUsername",
              message: "User is not a member of this room."
            }
          ]
        })
      }
    }

    return getSafeRoomObject(
      await this.update(
        { _id: room._id },
        {
          title: newTitle,
          owner: newOwner?._id,
          ...titleChangeMsg,
          ...ownerChangeMsg
        }
      )
    )
  }

  async inviteUser(
    room: RoomDocument,
    owner: UserDocument,
    user: UserDocument
  ) {
    if (room.members.some((member) => member._id.toString() === user.id)) {
      throw new BadRequestException({
        errors: [
          {
            field: "username",
            message: "User is already a member of this room."
          }
        ]
      })
    } else if (
      room.pendingInvitations.some(
        (member) => member._id.toString() === user.id
      )
    ) {
      throw new BadRequestException({
        errors: [
          {
            field: "username",
            message: "User is already invited."
          }
        ]
      })
    }

    return getSafeRoomObject(
      await this.update(
        { _id: room._id },
        {
          $push: {
            pendingInvitations: user._id,
            messages: {
              type: "system",
              content: `${owner.username} invited ${user.username} to join the room`
            }
          }
        }
      )
    )
  }

  async acceptInvitation(roomId: string, user: UserDocument) {
    return getSafeRoomObject(
      await this.update(
        { _id: roomId },
        {
          $push: {
            members: user._id,
            messages: {
              type: "system",
              content: `${user.username} joined the room`
            }
          },
          $pull: { pendingInvitations: user._id }
        }
      )
    )
  }

  async rejectInvitation(roomId: string, user: UserDocument) {
    return getSafeRoomObject(
      await this.update(
        { _id: roomId },
        {
          $push: {
            messages: {
              type: "system",
              content: `${user.username} rejected the invitation`
            }
          },
          $pull: { pendingInvitations: user._id }
        }
      )
    )
  }

  // Basic Operations - Intended to keep the code clean.

  async get(_id: string): Promise<RoomDocument | null> {
    return this.roomModel.findOne({ _id }).exec()
  }

  async create(title: string, owner: UserDocument): Promise<RoomDocument> {
    return new this.roomModel({
      title,
      owner,
      members: [owner._id],
      messages: [
        {
          type: "system",
          content: `${owner.username} created the room "${title}"`
        }
      ]
    }).save()
  }

  async update(
    filter: FilterQuery<Room>,
    update: UpdateQuery<Room>
  ): Promise<RoomDocument> {
    return this.roomModel.findOneAndUpdate(filter, update, { new: true }).exec()
  }

  async delete(_id: string): Promise<RoomDocument> {
    return this.roomModel.findOneAndDelete({ _id }).exec()
  }
}
