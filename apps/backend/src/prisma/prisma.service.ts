import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

/**
 * PrismaService — обёртка над Prisma Client для интеграции с NestJS.
 *
 * Prisma 7 перешёл на Driver Adapter архитектуру — прямое подключение
 * к БД теперь происходит через адаптер (@prisma/adapter-pg для PostgreSQL).
 *
 * Используем композицию вместо наследования: все операции с БД
 * доступны через геттеры this.user и this.task.
 *
 * - OnModuleInit    — открываем соединение при старте приложения
 * - OnModuleDestroy — закрываем соединение при остановке
 */
@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  readonly client: PrismaClient;

  constructor() {
    // Prisma 7 requires a Driver Adapter for direct database connections.
    // PrismaPg uses the pg library under the hood and reads DATABASE_URL from env.
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
    this.client = new PrismaClient({ adapter });
  }

  // Прокси-геттеры — позволяют писать this.prisma.user вместо this.prisma.client.user
  get user() {
    return this.client.user;
  }

  get task() {
    return this.client.task;
  }

  async onModuleInit(): Promise<void> {
    await this.client.$connect();
    this.logger.log('Database connection established');
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.$disconnect();
    this.logger.log('Database connection closed');
  }
}
