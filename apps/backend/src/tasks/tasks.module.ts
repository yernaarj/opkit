import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';

/**
 * TasksModule — управление задачами пользователя.
 * PrismaService доступен без импорта (@Global из PrismaModule).
 */
@Module({
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService], // экспортируем для будущего использования в WebSocket Gateway
})
export class TasksModule {}
