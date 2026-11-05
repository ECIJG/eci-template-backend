import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma-clients/db-3';

@Injectable()
export class NovasoftPrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NovasoftPrismaService.name);

  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
  }

  async onModuleInit() {
    if (!process.env.DATABASE_URL_NOVASOFT) {
      this.logger.debug('DATABASE_URL_NOVASOFT no definida; omitiendo conexion DB-3');
      return;
    }

    try {
      await this.$connect();
      this.logger.log('Conectado exitosamente a la Base de Datos Novasoft (DB-3)');
    } catch (error) {
      this.logger.warn(`No se pudo conectar a la Base de Datos Novasoft en el inicio: ${error.message}`);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Desconectado de la Base de Datos Novasoft (DB-3)');
  }
}
