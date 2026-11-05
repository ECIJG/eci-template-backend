import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AzureLoginDto {
  @ApiProperty({
    description: 'id_token JWT emitido por Microsoft Entra ID (Azure AD)',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6Ii4uLiJ9...',
  })
  @IsString()
  @IsNotEmpty({ message: 'El idToken de Azure es obligatorio' })
  idToken: string;
}
