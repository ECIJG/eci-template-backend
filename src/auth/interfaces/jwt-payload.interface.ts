export interface JwtPayload {
  sub: number; // ID del usuario
  rol: string; // Rol del usuario (admin, docente, estudiante, administrativo, etc.)
  correo: string;
  documento?: string;
  nombre?: string;
  iat?: number; // Fecha de emision
  exp?: number; // Fecha de expiracion
}

export interface AuthenticatedUser {
  userId: number;
  rol: string;
  correo: string;
  documento?: string;
  nombre?: string;
}
