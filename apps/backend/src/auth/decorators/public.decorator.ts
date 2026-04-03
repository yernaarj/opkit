import { SetMetadata } from '@nestjs/common';

/**
 * Ключ метаданных для маркировки публичных роутов.
 * Используется в JwtAuthGuard для пропуска авторизации.
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * @Public() — декоратор для контроллеров/методов, которые не требуют JWT.
 *
 * Пример:
 *   @Public()
 *   @Post('register')
 *   register(@Body() dto: RegisterDto) { ... }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
