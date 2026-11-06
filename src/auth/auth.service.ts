import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
  // Inyecta el servicio JwtService proporcionado por @nestjs/jwt
  constructor(private readonly jwtService: JwtService) {}

  generateToken(payload: any): string {
    // Puedes definir una interfaz más específica para el payload si quieres
    // El método sign() usa la clave secreta y las opciones de expiración configuradas en JwtModule
    const firma = payload as string;

    return this.jwtService.sign(firma);
  }

  verifyToken(token: string): any {
    try {
      return this.jwtService.verify(token); // Verifica la firma y expiración
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException("Token inválido o expirado");
    }
  }

  decodeToken(token: string): any {
    return this.jwtService.decode(token); // Decodifica el token SIN verificar la firma
  }
}
