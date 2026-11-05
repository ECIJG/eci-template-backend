import { Global, Module } from '@nestjs/common';
import { PrimaryPrismaService } from './primary-prisma.service';
import { Db2PrismaService } from './db2-prisma.service';
import { Db3PrismaService } from './db3-prisma.service';

@Global()
@Module({
  providers: [PrimaryPrismaService, Db2PrismaService, Db3PrismaService],
  exports: [PrimaryPrismaService, Db2PrismaService, Db3PrismaService],
})
export class DatabaseModule {}
