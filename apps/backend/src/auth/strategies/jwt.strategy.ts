import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

/**
 * Payload, который мы кладём в JWT при логине.
 * sub — стандартное поле JWT (subject = userId)
 */
export interface JwtPayload {
  sub: string;  // userId
  email: string;
}

/**
 * JwtStrategy — валидирует Bearer токен из заголовка Authorization.
 *
 * Passport автоматически вызывает validate() после проверки подписи токена.
 * Возвращаемый объект прикрепляется к request.user и доступен в контроллерах.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      // Извлекаем токен из заголовка: Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Отклоняем просроченные токены
      ignoreExpiration: false,
      // Секрет для верификации подписи — должен совпадать с тем, что в JwtModule
      // getOrThrow бросает ошибку при старте если JWT_SECRET не задан в .env
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  /**
   * Вызывается после успешной верификации JWT подписи.
   * Здесь проверяем, что пользователь всё ещё существует в БД.
   */
  async validate(payload: JwtPayload) {
    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    // Этот объект будет доступен как request.user в контроллерах
    return { id: user.id, email: user.email };
  }
}
