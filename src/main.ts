import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3001;

  // Prefijo global de la API
  app.setGlobalPrefix('api');

  // Configuración de validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Configuración de CORS basada en la variable CORS_ORIGINS
  const rawOrigins = configService.get<string>('CORS_ORIGINS') || 'http://localhost:3000,http://localhost:3001';
  const allowedOrigins = rawOrigins
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      // Permitir peticiones sin origin (como herramientas internas, curl o mobile apps)
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        logger.warn(`Petición bloqueada por CORS desde el origen: ${origin}`);
        callback(new Error(`Origen ${origin} no permitido por CORS`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Configuración de Documentación Swagger / OpenAPI
  const swaggerConfig = new DocumentBuilder()
    .setTitle('ECI Backend API')
    .setDescription(
      'API REST con autenticación institucional Azure AD (Microsoft Entra ID), JWT y soporte Multi-Base de Datos con Prisma.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Ingresa tu Bearer JWT token generado por /api/auth/azure-login o /api/auth/dev-login',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Habilitar shutdown hooks
  app.enableShutdownHooks();

  await app.listen(port);
  logger.log(`====================================================`);
  logger.log(`🚀 Servidor ejecutándose en: http://localhost:${port}/api`);
  logger.log(`📖 Documentación Swagger:    http://localhost:${port}/docs`);
  logger.log(`====================================================`);
}

bootstrap();
