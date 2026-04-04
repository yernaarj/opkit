import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';

/**
 * AuthController — публичные роуты аутентификации.
 *
 * Все методы помечены @Public() — они не требуют JWT токена.
 * @Throttle переопределяет глобальный лимит: не более 5 попыток
 * регистрации/логина в минуту с одного IP — защита от брутфорса.
 */
@Controller('auth')
@Throttle({ default: { ttl: 60_000, limit: 5 } })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /api/auth/register
   * Тело: { email: string, password: string }
   * Ответ: { accessToken: string, user: { id, email } }
   */
  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /**
   * POST /api/auth/login
   * HttpCode(200) — по умолчанию POST возвращает 201, но для логина правильнее 200
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
