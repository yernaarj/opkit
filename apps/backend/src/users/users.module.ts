import { Module } from '@nestjs/common';
import { UsersService } from './users.service';

/**
 * UsersModule — отвечает только за CRUD пользователей.
 * Экспортируем UsersService, чтобы AuthModule мог его использовать.
 */
@Module({
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
