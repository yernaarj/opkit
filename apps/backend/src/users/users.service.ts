import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import type { User } from '@prisma/client';

// Количество раундов bcrypt — баланс между безопасностью и скоростью
// 10 раундов: ~100ms на современном железе (рекомендуемый минимум)
const BCRYPT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Создаёт нового пользователя.
   * Бросает ConflictException если email уже занят.
   */
  async create(email: string, password: string): Promise<User> {
    // Проверяем уникальность email до хеширования (дешёвая операция)
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    return this.prisma.user.create({
      data: { email, password: hashedPassword },
    });
  }

  /**
   * Ищет пользователя по email.
   * Используется в стратегии JWT и при логине.
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  /**
   * Ищет пользователя по id.
   * Используется в JWT стратегии для валидации токена.
   */
  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
