import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma-clients/db-3';

@Injectable()
export class Db3PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(Db3PrismaService.name);

  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
  }

  async onModuleInit() {
    if (!process.env.DATABASE_URL_DB3) {
      this.logger.debug('DATABASE_URL_DB3 no definida; omitiendo conexion DB-3');
      return;
    }

    try {
      await this.$connect();
      this.logger.log('Conectado exitosamente a la Base de Datos 3 (DB-3)');
    } catch (error) {
      this.logger.warn(`No se pudo conectar a la Base de Datos 3 en el inicio: ${error.message}`);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Desconectado de la Base de Datos 3 (DB-3)');
  }
}
