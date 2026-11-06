import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

// Extiende AuthGuard y especifica la estrategia 'jwt'
@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}
