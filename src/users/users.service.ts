import { Injectable, NotFoundException } from '@nestjs/common';
import { PrimaryPrismaService } from '../database/primary-prisma.service';
import { NovasoftPrismaService } from '../database/novasoft-prisma.service';
import { AppmovilPrismaService } from '../database/appmovil-prisma.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly primaryPrisma: PrimaryPrismaService,
    private readonly novasoftPrisma: NovasoftPrismaService,
    private readonly appmovilPrisma: AppmovilPrismaService,
  ) {}

  async findAll() {
    return this.primaryPrisma.usuario.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByCorreo(correo: string) {
    const user = await this.primaryPrisma.usuario.findUnique({
      where: { correo },
    });
    if (!user) {
      throw new NotFoundException(`Usuario con correo ${correo} no encontrado`);
    }
    return user;
  }

  /**
   * Demostración de consulta multi-base de datos:
   * Combina datos del usuario de la BD Principal con su perfil de Novasoft y sus dispositivos móviles.
   */
  async getFullUserOverview(correo: string) {
    const user = await this.primaryPrisma.usuario.findUnique({ where: { correo } });

    let novasoftProfile = null;
    try {
      novasoftProfile = await this.novasoftPrisma.empleadoNovasoft.findFirst({
        where: { correo },
      });
    } catch {
      // DB-3 no configurada o inaccesible
    }

    let mobileDevices = [];
    try {
      mobileDevices = await this.appmovilPrisma.dispositivo.findMany({
        where: { correo },
      });
    } catch {
      // DB-2 no configurada o inaccesible
    }

    return {
      user,
      novasoftProfile,
      mobileDevices,
    };
  }
}
