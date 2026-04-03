import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * PrismaModule — глобальный модуль для доступа к БД.
 *
 * @Global() означает, что PrismaService автоматически доступен
 * во всех модулях приложения без необходимости явного импорта.
 *
 * Достаточно один раз добавить PrismaModule в AppModule.imports.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
