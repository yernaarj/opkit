import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';

/**
 * AppModule — корневой модуль приложения.
 *
 * Здесь только глобальные провайдеры (Config, Prisma).
 * Бизнес-модули (Auth, Tasks) подключаются по мере реализации.
 */
@Module({
  imports: [
    // ConfigModule читает .env и делает переменные доступными через ConfigService
    // isGlobal: true — не нужно импортировать в каждом модуле отдельно
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // PrismaModule — глобальный доступ к БД через PrismaService
    PrismaModule,
  ],
})
export class AppModule {}
