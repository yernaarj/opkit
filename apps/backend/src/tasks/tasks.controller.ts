import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { GetTasksDto } from './dto/get-tasks.dto';

/**
 * TasksController — CRUD для задач текущего пользователя.
 *
 * Все роуты защищены глобальным JwtAuthGuard (без @Public()).
 * Текущий пользователь доступен через req.user (прокидывает JwtStrategy).
 */
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  /**
   * GET /api/tasks
   * GET /api/tasks?status=TODO
   * GET /api/tasks?status=IN_PROGRESS
   * GET /api/tasks?status=DONE
   *
   * Без параметра — возвращает все задачи пользователя.
   * С параметром — фильтрует по статусу.
   */
  @Get()
  findAll(
    @Request() req: { user: { id: string } },
    @Query() query: GetTasksDto,
  ) {
    return this.tasksService.findAll(req.user.id, query);
  }

  /**
   * POST /api/tasks
   * Создаёт задачу, автоматически привязывает к текущему пользователю.
   */
  @Post()
  create(
    @Request() req: { user: { id: string } },
    @Body() dto: CreateTaskDto,
  ) {
    return this.tasksService.create(req.user.id, dto);
  }

  /**
   * PATCH /api/tasks/:id
   * Обновляет поля задачи (title, description, status).
   * Можно передать любое сочетание полей — остальные не тронутся.
   */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(id, req.user.id, dto);
  }

  /**
   * DELETE /api/tasks/:id
   * 204 No Content — стандартный статус для успешного удаления.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.tasksService.remove(id, req.user.id);
  }
}
