// src/auth/auth.module.ts (Modificado)
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { ConfigService, ConfigModule } from "@nestjs/config";
import { JwtStrategy } from "./JwtStrategy";
import { AzureTokenService } from "./azure-token.service";

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: "jwt" }), // Opcional: Define 'jwt' como estrategia por defecto si lo necesitas
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET"),
        signOptions: { expiresIn: "1h" },
      }),
      inject: [ConfigService],
    }),
    ConfigModule,
  ],
  // *** Añade JwtStrategy a los providers ***
  providers: [AuthService, JwtStrategy, AzureTokenService],
  // Es útil exportar la estrategia si necesitas referenciar su tipo en otros módulos
  exports: [AuthService, JwtModule, JwtStrategy, AzureTokenService],
})
export class AuthModule {}
