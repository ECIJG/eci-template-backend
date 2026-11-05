import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Usuarios (Users)')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('admin')
  @ApiOperation({
    summary: 'Listar usuarios (Solo administradores)',
    description: 'Ruta protegida que requiere token JWT válido y rol admin.',
  })
  @ApiResponse({ status: 200, description: 'Lista de usuarios registrados.' })
  @ApiResponse({ status: 403, description: 'Prohibido: se requiere rol admin.' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':correo')
  @Roles('admin')
  @ApiOperation({
    summary: 'Consultar usuario por correo (Solo administradores)',
    description: 'Ruta protegida que busca un usuario en la Base de Datos Principal.',
  })
  @ApiResponse({ status: 200, description: 'Datos del usuario consultado.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  findByCorreo(@Param('correo') correo: string) {
    return this.usersService.findByCorreo(correo);
  }
}
