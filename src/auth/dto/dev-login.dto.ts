import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DevLoginDto {
  @ApiProperty({
    description: 'Correo institucional para pruebas en modo desarrollo',
    example: 'admin@escuelaing.edu.co',
  })
  @IsEmail()
  @IsNotEmpty()
  correo: string;

  @ApiProperty({
    description: 'Rol para pruebas locales',
    example: 'admin',
    required: false,
    default: 'admin',
  })
  @IsString()
  @IsOptional()
  rol?: string;

  @ApiProperty({
    description: 'Nombre del usuario de prueba',
    example: 'Desarrollador ECI',
    required: false,
  })
  @IsString()
  @IsOptional()
  nombre?: string;
}
