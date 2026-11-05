import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { AuthenticatedUser } from './interfaces/jwt-payload.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<{ user?: AuthenticatedUser }>();
    if (!user || !user.rol) {
      throw new ForbiddenException('Acceso denegado: usuario no autenticado o sin rol asignado');
    }

    const hasRole = requiredRoles.includes(user.rol.toLowerCase());
    if (!hasRole) {
      throw new ForbiddenException(`Acceso denegado: se requiere uno de los roles [${requiredRoles.join(', ')}]`);
    }

    return true;
  }
}
