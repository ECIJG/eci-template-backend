import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AzureTokenService } from './azure-token.service';
import { PrimaryPrismaService } from '../database/primary-prisma.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly azureTokenService: AzureTokenService,
    private readonly primaryPrisma: PrimaryPrismaService,
  ) {}

  /**
   * Genera un token JWT firmado por la aplicación usando la clave secreta y expiración configuradas.
   */
  generateToken(payload: JwtPayload | Record<string, any>): string {
    return this.jwtService.sign(payload);
  }

  /**
   * Verifica la validez y expiración de un token JWT.
   */
  verifyToken<T = any>(token: string): T {
    try {
      return this.jwtService.verify<T>(token);
    } catch (error) {
      this.logger.warn(`Fallo al verificar token JWT: ${error.message}`);
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  /**
   * Decodifica un token JWT sin verificar la firma (útil para inspeccionar claims).
   */
  decodeToken<T = any>(token: string): T | null {
    return this.jwtService.decode(token) as T;
  }

  /**
   * Valida un id_token de Microsoft Entra ID (Azure AD), sincroniza/consulta el usuario
   * en la base de datos principal y emite un JWT de sesión para el frontend.
   */
  async loginWithAzure(idToken: string): Promise<{
    accessToken: string;
    user: { id: number; correo: string; rol: string; nombre?: string; documento?: string };
  }> {
    // 1. Validar el token de Azure AD (firma JWKS de Microsoft, audiencia y tenant)
    const azureClaims = await this.azureTokenService.verifyIdToken(idToken);
    const correo = azureClaims.correo;

    // 2. Buscar o registrar el usuario en la Base de Datos Principal (DB-1)
    let usuario: any = null;
    try {
      usuario = await this.primaryPrisma.usuario.findUnique({
        where: { correo },
      });
    } catch (dbError) {
      this.logger.warn(`Error al consultar DB-1: ${dbError.message}. Usando fallback para desarrollo.`);
    }

    if (!usuario) {
      try {
        usuario = await this.primaryPrisma.usuario.create({
          data: {
            correo,
            nombre: azureClaims.name || correo.split('@')[0],
            rol: 'user',
            activo: true,
          },
        });
      } catch {
        // En caso de que la BD aún no tenga migraciones aplicadas en desarrollo
        usuario = {
          id: 1,
          correo,
          nombre: azureClaims.name || correo.split('@')[0],
          rol: 'user',
          documento: '00000000',
        };
      }
    }

    if (usuario.activo === false) {
      throw new UnauthorizedException('Usuario inactivo en el sistema');
    }

    // 3. Generar JWT firmado con los claims de la aplicación
    const payload: JwtPayload = {
      sub: usuario.id,
      rol: usuario.rol,
      correo: usuario.correo,
      documento: usuario.documento,
      nombre: usuario.nombre,
    };

    const accessToken = this.generateToken(payload);

    return {
      accessToken,
      user: {
        id: usuario.id,
        correo: usuario.correo,
        rol: usuario.rol,
        nombre: usuario.nombre,
        documento: usuario.documento,
      },
    };
  }

  /**
   * Inicio de sesión para entorno de desarrollo local (sin necesidad de Azure AD en vivo)
   */
  async loginDev(correo: string, rol = 'admin', nombre = 'Usuario Dev'): Promise<{
    accessToken: string;
    user: { id: number; correo: string; rol: string; nombre: string };
  }> {
    const payload: JwtPayload = {
      sub: 9999,
      rol,
      correo,
      nombre,
    };

    const accessToken = this.generateToken(payload);
    return {
      accessToken,
      user: {
        id: 9999,
        correo,
        rol,
        nombre,
      },
    };
  }
}
