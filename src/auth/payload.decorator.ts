import { createParamDecorator, ExecutionContext } from "@nestjs/common";

interface AuthenticatedUserPayload {
  userId: number; // O el tipo correcto de tu ID de usuario
  rol: string;
  documento: string;
  correo: string;
  // ... añade otras propiedades que retornes en validate() si las necesitas
}

export const Payload = createParamDecorator(
  (data: keyof AuthenticatedUserPayload | undefined, ctx: ExecutionContext) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = ctx.switchToHttp().getRequest();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const user = request.user as AuthenticatedUserPayload;

    return data ? user?.[data] : user;
  },
);
