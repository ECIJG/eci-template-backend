import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma-clients/db-1';

@Injectable()
export class PrimaryPrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrimaryPrismaService.name);

  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Conectado exitosamente a la Base de Datos Principal (DB-1)');
    } catch (error) {
      this.logger.warn(`No se pudo conectar a la Base de Datos Principal en el inicio: ${error.message}`);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Desconectado de la Base de Datos Principal (DB-1)');
  }
}
