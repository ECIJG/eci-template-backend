import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload, AuthenticatedUser } from './interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET') || 'super_secret_jwt_key_eci_change_in_production_xyz123';

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      algorithms: ['HS256'],
      secretOrKey: secret,
    });
  }

  /**
   * Este método es llamado por Passport después de que el token es extraído y su firma es verificada.
   * Recibe el payload decodificado del token como argumento.
   * @param payload El payload decodificado del token.
   * @returns Un objeto que será adjuntado a `request.user`.
   */
  validate(payload: JwtPayload): AuthenticatedUser {
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Token inválido: payload sin identificador');
    }

    // Si la variable JWT_RESTRICT_ADMIN_ONLY está en 'true', restringe todas las rutas JWT a admin
    const restrictAdminOnly = this.configService.get<string>('JWT_RESTRICT_ADMIN_ONLY') === 'true';
    if (restrictAdminOnly && payload.rol !== 'admin') {
      throw new UnauthorizedException('Acceso denegado: se requieren permisos de administrador');
    }

    return {
      userId: payload.sub,
      rol: payload.rol,
      correo: payload.correo,
      documento: payload.documento,
      nombre: payload.nombre,
    };
  }
}
