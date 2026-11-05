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

  @Get(':correo/overview')
  @Roles('admin')
  @ApiOperation({
    summary: 'Resumen consolidado Multi-DB de un usuario',
    description: 'Demuestra lectura simultánea de DB-1 (Principal), DB-2 (AppMovil) y DB-3 (Novasoft).',
  })
  getOverview(@Param('correo') correo: string) {
    return this.usersService.getFullUserOverview(correo);
  }
}
