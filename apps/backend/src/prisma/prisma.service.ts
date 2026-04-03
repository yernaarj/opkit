import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma';

/**
 * PrismaService wraps the Prisma Client and integrates its lifecycle
 * with the NestJS module system.
 *
 * - OnModuleInit  — открываем соединение с БД при старте модуля
 * - OnModuleDestroy — закрываем соединение при завершении приложения
 *
 * Наследуемся от PrismaClient, чтобы все методы (prisma.user.findMany и т.д.)
 * были доступны напрямую через this.prisma в сервисах.
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit(): Promise<void> {
    await this.();
    this.logger.log('Database connection established');
  }

  async onModuleDestroy(): Promise<void> {
    await this.();
    this.logger.log('Database connection closed');
  }
}
