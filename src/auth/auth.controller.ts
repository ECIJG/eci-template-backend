import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AzureLoginDto } from './dto/azure-login.dto';
import { DevLoginDto } from './dto/dev-login.dto';
import { JwtAuthGuard } from './auth.guard';
import { Payload } from './payload.decorator';
import { AuthenticatedUser } from './interfaces/jwt-payload.interface';

@ApiTags('Autenticación (Auth)')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('azure-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Iniciar sesión con Azure AD (Microsoft Entra ID)',
    description:
      'Recibe el id_token generado por el frontend (Next.js / MSAL), valida su firma y emite un JWT firmado por la API.',
  })
  @ApiResponse({ status: 200, description: 'Autenticación exitosa, retorna accessToken y datos de usuario.' })
  @ApiResponse({ status: 401, description: 'Token de Azure inválido, expirado o tenant no autorizado.' })
  async azureLogin(@Body() dto: AzureLoginDto) {
    return this.authService.loginWithAzure(dto.idToken);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Obtener perfil del usuario autenticado',
    description: 'Endpoint protegido mediante JwtAuthGuard que recupera el payload decodificado con @Payload().',
  })
  @ApiResponse({ status: 200, description: 'Datos del usuario autenticado.' })
  @ApiResponse({ status: 401, description: 'No autorizado / Token ausente o inválido.' })
  getProfile(@Payload() user: AuthenticatedUser) {
    return {
      message: 'Usuario autenticado correctamente',
      user,
    };
  }

  @Post('dev-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login simulado para pruebas locales (Solo disponible en desarrollo)',
    description: 'Genera un token JWT de prueba sin requerir conexión en vivo con Microsoft Entra ID.',
  })
  async devLogin(@Body() dto: DevLoginDto) {
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException('Este endpoint solo está habilitado en entorno de desarrollo.');
    }
    return this.authService.loginDev(dto.correo, dto.rol || 'admin', dto.nombre || 'Usuario Dev');
  }
}
