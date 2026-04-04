import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Декоратор @CurrentUser() — извлекает поле из JWT payload.
 * Пример: @CurrentUser('sub') userId: string
 */
export const CurrentUser = createParamDecorator(
  (field: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return field ? user?.[field] : user;
  },
);
