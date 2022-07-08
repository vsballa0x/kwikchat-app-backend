import * as Joi from "joi"
import * as session from "express-session"
import * as RedisStore from "connect-redis"
import * as passport from "passport"
import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { RedisModule, RedisService } from "@liaoliaots/nestjs-redis"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { UserModule } from "./user/user.module"
import { ThrottlerModule } from "@nestjs/throttler"
import { RoomModule } from "./room/room.module"
import { AuthModule } from "./auth/auth.module"
import { MessageModule } from "./message/message.module"

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
        REDIS_URI: Joi.string().required(),
        SENDGRID_API_KEY: Joi.string().required(),
        SESSION_SECRET: Joi.string().required(),
        THROTTLER_TTL: Joi.number().required(),
        THROTTLER_LIMIT: Joi.number().required()
      })
    }),
    UserModule,
    AuthModule,
    RoomModule,
    MessageModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get("MONGODB_URI")
      }),
      inject: [ConfigService]
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        config: {
          url: configService.get("REDIS_URI")
        }
      }),
      inject: [ConfigService]
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ttl: configService.get("THROTTLER_TTL"),
        limit: configService.get("THROTTLER_LIMIT")
      }),
      inject: [ConfigService]
    })
  ]
})
export class AppModule implements NestModule {
  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService
  ) {}

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        session({
          store: new (RedisStore(session))({
            client: this.redisService.getClient()
          }),
          saveUninitialized: false,
          secret: this.configService.get("SESSION_SECRET"),
          resave: false,
          cookie: {
            secure: false,
            httpOnly: false,
            maxAge: 3600_000
          }
        }),
        passport.initialize(),
        passport.session()
      )
      .forRoutes("*")
  }
}
