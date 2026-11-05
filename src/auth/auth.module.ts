import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './JwtStrategy';
import { AzureTokenService } from './azure-token.service';
import { RolesGuard } from './roles.guard';
import { JwtAuthGuard } from './auth.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'super_secret_jwt_key_eci_change_in_production_xyz123',
        signOptions: { expiresIn: '8h' },
      }),
      inject: [ConfigService],
    }),
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, AzureTokenService, RolesGuard, JwtAuthGuard],
  exports: [AuthService, JwtModule, JwtStrategy, AzureTokenService, RolesGuard, JwtAuthGuard],
})
export class AuthModule {}
