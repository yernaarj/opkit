import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import { BoardsModule } from './boards/boards.module';
import { LabelsModule } from './labels/labels.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

/**
 * AppModule — корневой модуль приложения.
 *
 * Архитектурные решения:
 *  - ConfigModule.forRoot({ isGlobal: true }) — .env доступен везде
 *  - PrismaModule (@Global)                   — БД доступна везде без импорта
 *  - ThrottlerModule                          — глобальный rate limiting
 *  - APP_GUARD: JwtAuthGuard                  — все роуты защищены JWT по умолчанию
 *    Исключения помечаются декоратором @Public() на уровне контроллера/метода
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // Rate limiting: не более 20 запросов за 60 секунд с одного IP (глобально)
    // На /auth роутах переопределяем жёстче через @Throttle() декоратор
    ThrottlerModule.forRoot([
      {
        ttl: 60_000, // окно в миллисекундах (60 сек)
        limit: 20,   // максимум запросов за окно
      },
    ]),

    PrismaModule,
    AuthModule,
    UsersModule,
    TasksModule,
    BoardsModule,
    LabelsModule,
  ],
  providers: [
    // Глобальный JWT guard — все роуты защищены по умолчанию
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Глобальный rate limit guard — применяется ко всем роутам
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
