import {
  ExceptionFilter,
  ArgumentsHost,
  Catch,
  Logger,
  HttpStatus
} from "@nestjs/common"

import { Response } from "express"
import { Error as MongooseError } from "mongoose"
import { MongoServerError } from "mongodb"

@Catch(MongooseError, MongoServerError)
export class MongoExceptionFilter implements ExceptionFilter {
  catch(exception: MongooseError, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const res: Response = ctx.getResponse()
    const errors: { field?: string; message: string }[] = []

    let statusCode = HttpStatus.BAD_REQUEST

    if (exception instanceof MongoServerError && exception.code === 11000) {
      for (const field in exception.keyPattern) {
        errors.push({ field, message: "Already in use." })
      }
    } else {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR
      errors.push({ message: "Internal server error." })
      Logger.error(exception)
    }

    res.status(statusCode).json({ errors })
  }
}
