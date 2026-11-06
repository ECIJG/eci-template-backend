import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt"; // Importa Strategy y ExtractJwt correctamente
import { ConfigService } from "@nestjs/config"; // Para leer variables de entorno

interface JwtPayload {
  sub: number; // Generalmente el ID del usuario ('sub' es un nombre estándar en JWT)
  rol: string; // El rol que pusiste en el payload
  iat?: number; // Fecha de emisión (viene por defecto)
  exp?: number; // Fecha de expiración (viene por defecto si usaste expiresIn)
  correo: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(private configService: ConfigService) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      algorithms: ["HS256"],
      secretOrKey: configService.get<string>("JWT_SECRET"),
    });
  }

  /**
   * Este método es llamado por Passport *después* de que el token es extraído y su firma es verificada
   * (es decir, después de verificar que no ha sido manipulado y no ha expirado si ignoreExpiration es false).
   * Recibe el payload decodificado del token como argumento.
   * @param payload El payload decodificado del token.
   * @returns Un objeto que será adjuntado a `request.user`.
   */
  validate(payload: JwtPayload) {
    // Usa la interfaz del payload
    // Los endpoints protegidos con este guard son solo de administración
    if (payload.rol !== "admin")
      throw new UnauthorizedException("Acceso denegado");

    return { userId: payload.sub, rol: payload.rol, correo: payload.correo };
  }
}
