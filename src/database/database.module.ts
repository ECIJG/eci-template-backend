import { Global, Module } from '@nestjs/common';
import { PrimaryPrismaService } from './primary-prisma.service';
import { AppmovilPrismaService } from './appmovil-prisma.service';
import { NovasoftPrismaService } from './novasoft-prisma.service';

@Global()
@Module({
  providers: [PrimaryPrismaService, AppmovilPrismaService, NovasoftPrismaService],
  exports: [PrimaryPrismaService, AppmovilPrismaService, NovasoftPrismaService],
})
export class DatabaseModule {}
