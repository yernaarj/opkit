import { Controller, Get, Post, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { LabelsService } from './labels.service';
import { CreateLabelDto } from './dto/create-label.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller()
export class LabelsController {
  constructor(private readonly labelsService: LabelsService) {}

  // GET  /api/boards/:boardId/labels
  @Get('boards/:boardId/labels')
  findAll(@CurrentUser('id') userId: string, @Param('boardId') boardId: string) {
    return this.labelsService.findAll(boardId, userId);
  }

  // POST /api/boards/:boardId/labels
  @Post('boards/:boardId/labels')
  create(
    @CurrentUser('id') userId: string,
    @Param('boardId') boardId: string,
    @Body() dto: CreateLabelDto,
  ) {
    return this.labelsService.create(boardId, userId, dto);
  }

  // DELETE /api/boards/:boardId/labels/:labelId
  @Delete('boards/:boardId/labels/:labelId')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @CurrentUser('id') userId: string,
    @Param('boardId') boardId: string,
    @Param('labelId') labelId: string,
  ) {
    return this.labelsService.remove(boardId, labelId, userId);
  }

  // POST /api/tasks/:taskId/labels/:labelId
  @Post('tasks/:taskId/labels/:labelId')
  @HttpCode(HttpStatus.NO_CONTENT)
  addToTask(
    @CurrentUser('id') userId: string,
    @Param('taskId') taskId: string,
    @Param('labelId') labelId: string,
  ) {
    return this.labelsService.addToTask(taskId, labelId, userId);
  }

  // DELETE /api/tasks/:taskId/labels/:labelId
  @Delete('tasks/:taskId/labels/:labelId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeFromTask(
    @CurrentUser('id') userId: string,
    @Param('taskId') taskId: string,
    @Param('labelId') labelId: string,
  ) {
    return this.labelsService.removeFromTask(taskId, labelId, userId);
  }
}
