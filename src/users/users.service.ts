import { Injectable, NotFoundException } from '@nestjs/common';
import { PrimaryPrismaService } from '../database/primary-prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly primaryPrisma: PrimaryPrismaService) {}

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

  async findById(id: number) {
    const user = await this.primaryPrisma.usuario.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return user;
  }
}
