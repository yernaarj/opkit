import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import type { RegisterDto } from './dto/register.dto';
import type { LoginDto } from './dto/login.dto';
import type { JwtPayload } from './strategies/jwt.strategy';
import * as bcrypt from 'bcrypt';

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Регистрация: создаём пользователя, личную доску и сразу возвращаем JWT.
   * Личная доска "Мои задачи" создаётся автоматически для каждого нового юзера.
   */
  async register(dto: RegisterDto): Promise<AuthResponse> {
    const user = await this.usersService.create(dto.email, dto.password);

    // Создаём личную доску и добавляем пользователя как участника
    await this.prisma.board.create({
      data: {
        name: 'Мои задачи',
        ownerId: user.id,
        members: { create: { userId: user.id } },
      },
    });

    return this.buildAuthResponse(user.id, user.email);
  }

  /**
   * Логин: проверяем email + пароль, возвращаем JWT.
   */
  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersService.findByEmail(dto.email);

    // Одинаковая ошибка — не раскрываем, существует ли email
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildAuthResponse(user.id, user.email);
  }

  private buildAuthResponse(userId: string, email: string): AuthResponse {
    const payload: JwtPayload = { sub: userId, email };
    return {
      accessToken: this.jwtService.sign(payload),
      user: { id: userId, email },
    };
  }
}
