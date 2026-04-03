import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * PrismaService — обёртка над Prisma Client для интеграции с NestJS.
 *
 * Наследуемся от PrismaClient (Prisma 6, CommonJS) — все методы доступны
 * напрямую: this.prisma.user.findMany(), this.prisma.task.create() и т.д.
 *
 * DATABASE_URL читается автоматически из переменных окружения (.env).
 *
 * - OnModuleInit    — открываем соединение при старте приложения
 * - OnModuleDestroy — закрываем соединение при остановке
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('Database connection established');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Database connection closed');
  }
}
