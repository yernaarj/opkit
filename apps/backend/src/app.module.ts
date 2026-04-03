import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

/**
 * AppModule — корневой модуль приложения.
 *
 * Архитектурные решения:
 *  - ConfigModule.forRoot({ isGlobal: true }) — .env доступен везде
 *  - PrismaModule (@Global)                   — БД доступна везде без импорта
 *  - APP_GUARD: JwtAuthGuard                  — все роуты защищены JWT по умолчанию
 *    Исключения помечаются декоратором @Public() на уровне контроллера/метода
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
  ],
  providers: [
    // Глобальный guard — применяется ко всем роутам без @UseGuards()
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
