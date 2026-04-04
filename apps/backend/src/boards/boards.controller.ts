import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  // GET /api/boards — список досок текущего пользователя
  @Get()
  findAll(@CurrentUser('id') userId: string) {
    return this.boardsService.findAll(userId);
  }

  // POST /api/boards — создать новую доску
  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateBoardDto) {
    return this.boardsService.create(userId, dto);
  }

  // DELETE /api/boards/:id — удалить доску
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser('id') userId: string, @Param('id') boardId: string) {
    return this.boardsService.remove(boardId, userId);
  }

  // POST /api/boards/:id/members — пригласить участника по email
  @Post(':id/members')
  inviteMember(
    @CurrentUser('id') userId: string,
    @Param('id') boardId: string,
    @Body() dto: InviteMemberDto,
  ) {
    return this.boardsService.inviteMember(boardId, userId, dto);
  }

  // DELETE /api/boards/:id/members/:memberId — удалить участника
  @Delete(':id/members/:memberId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeMember(
    @CurrentUser('id') userId: string,
    @Param('id') boardId: string,
    @Param('memberId') memberId: string,
  ) {
    return this.boardsService.removeMember(boardId, userId, memberId);
  }
}
