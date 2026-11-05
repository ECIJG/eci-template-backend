import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUser } from './interfaces/jwt-payload.interface';

export const Payload = createParamDecorator(
  (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser;

    return data ? user?.[data] : user;
  },
);
