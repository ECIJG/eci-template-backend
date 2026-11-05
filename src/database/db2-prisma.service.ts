import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma-clients/db-2';

@Injectable()
export class Db2PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(Db2PrismaService.name);

  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
  }

  async onModuleInit() {
    if (!process.env.DATABASE_URL_DB2) {
      this.logger.debug('DATABASE_URL_DB2 no definida; omitiendo conexion DB-2');
      return;
    }

    try {
      await this.$connect();
      this.logger.log('Conectado exitosamente a la Base de Datos 2 (DB-2)');
    } catch (error) {
      this.logger.warn(`No se pudo conectar a la Base de Datos 2 en el inicio: ${error.message}`);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Desconectado de la Base de Datos 2 (DB-2)');
  }
}
