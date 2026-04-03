import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
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
  ) {}

  /**
   * Регистрация нового пользователя.
   * Делегирует создание в UsersService (хеширование там же).
   * Возвращает JWT сразу — пользователь залогинен после регистрации.
   */
  async register(dto: RegisterDto): Promise<AuthResponse> {
    const user = await this.usersService.create(dto.email, dto.password);
    return this.buildAuthResponse(user.id, user.email);
  }

  /**
   * Логин: проверяем email + пароль, возвращаем JWT.
   * Используем bcrypt.compare — безопасное сравнение хешей.
   */
  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersService.findByEmail(dto.email);

    // Одинаковая ошибка для "нет пользователя" и "неверный пароль"
    // — не даём атакующему определить, существует ли email
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildAuthResponse(user.id, user.email);
  }

  /**
   * Формирует JWT и объект ответа.
   * Вынесено в приватный метод — переиспользуется в register и login.
   */
  private buildAuthResponse(userId: string, email: string): AuthResponse {
    const payload: JwtPayload = { sub: userId, email };

    return {
      accessToken: this.jwtService.sign(payload),
      user: { id: userId, email },
    };
  }
}
