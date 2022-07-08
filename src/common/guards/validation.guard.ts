import * as Joi from "joi"

import {
  mixin,
  Type,
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException
} from "@nestjs/common"

export enum FieldType {
  ObjectId,
  Email,
  Username,
  Password,
  Boolean,
  OTP,
  RoomTitle,
  MessageContent
}

export type ValidationInput = {
  [key: string]: { type: FieldType; required: boolean }
}

const typeToSchema: { [key in FieldType]: Joi.Schema<any> } = {
  [FieldType.ObjectId]: Joi.string().hex().length(24),
  [FieldType.Email]: Joi.string().email(),
  [FieldType.Username]: Joi.string()
    .pattern(/^[a-z][a-z0-9]{2,31}$/)
    .messages({
      "string.pattern.base":
        "Value of {{#label}} must be an alphanumeric string with a length of 3-32 characters."
    }),
  [FieldType.Password]: Joi.string().min(8),
  [FieldType.Boolean]: Joi.boolean(),
  [FieldType.OTP]: Joi.string()
    .pattern(/^\d{6}$/)
    .messages({
      "string.pattern.base":
        "{{#label}} must be a numeric string of 6 characters"
    }),
  [FieldType.RoomTitle]: Joi.string().min(3).max(25),
  [FieldType.MessageContent]: Joi.string()
    .pattern(/^[^\s]+(\s+[^\s]+)*$/)
    .messages({
      "string.pattern.base":
        "Value of {{#label}} must start with a non-space character."
    })
}

// prettier-ignore
const validationMessages = {
  "any.required": "Field {{#label}} is required.",
  "string.base": "Value of {{#label}} must be a string.",
  "string.min": "Value of {{#label}} must be at least {{#limit}} characters long.",
  "string.max": "Value of {{#label}} must be less than or equal to {{#limit}} characters long.",
  "string.empty": "Value of {{#label}} is not allowed to be empty.",
  "string.hex": "Value of {{#label}} must only contain hexadecimal characters.",
  "string.email": "Value of {{#label}} must be a valid email."
}

export const ValidationGuard = (fields: ValidationInput): Type<CanActivate> => {
  @Injectable()
  class ValidationGuardMixin implements CanActivate {
    async canActivate(context: ExecutionContext) {
      const req: Request = context.switchToHttp().getRequest()
      const joiSchema: Joi.PartialSchemaMap<any> = {}
      const values = {}

      for (const field in fields) {
        values[field] = req.body[field]
        joiSchema[field] = fields[field].required
          ? typeToSchema[fields[field].type].required()
          : typeToSchema[fields[field].type]
      }

      try {
        Joi.assert(values, Joi.object(joiSchema).messages(validationMessages), {
          abortEarly: false,
          errors: {
            wrap: {
              label: "`"
            }
          }
        })
      } catch (err) {
        const errDetails = (err as Joi.ValidationError).details
        throw new BadRequestException({
          errors: errDetails.map((item) => {
            return {
              field: item.path[0],
              message: item.message
            }
          })
        })
      }

      return true
    }
  }

  const guard = mixin(ValidationGuardMixin)
  return guard
}
