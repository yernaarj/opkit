import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * AuthModule — модуль аутентификации.
 *
 * Импортирует:
 *  - UsersModule      — для доступа к UsersService
 *  - PassportModule   — базовая интеграция Passport с NestJS
 *  - JwtModule        — async конфигурация из ConfigService (читает JWT_SECRET из .env)
 */
@Module({
  imports: [
    UsersModule,
    PrismaModule,

    PassportModule,

    // Async конфигурация — ждём пока ConfigModule загрузит .env
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          // Приводим к StringValue — тип из @nestjs/jwt (ms-совместимая строка)
          expiresIn: (config.get<string>('JWT_EXPIRES_IN') ?? '7d') as '7d',
        },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
