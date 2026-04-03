import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * JwtAuthGuard — глобальный guard для защиты всех роутов через JWT.
 *
 * Логика:
 *  1. Если роут помечен @Public() — пропускаем без проверки токена.
 *  2. Иначе — стандартная JWT верификация через Passport.
 *
 * Регистрируется глобально в AppModule через APP_GUARD,
 * поэтому все роуты защищены по умолчанию без @UseGuards().
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Проверяем метаданные — есть ли @Public() на методе или классе
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Публичный роут — пропускаем без проверки токена
    if (isPublic) return true;

    // Иначе — стандартная Passport JWT верификация
    return super.canActivate(context);
  }
}
