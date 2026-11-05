# ECI Backend Template (NestJS + Multi-DB Prisma + Azure AD / JWT)

Plantilla backend genérica, limpia y robusta para la Escuela Colombiana de Ingeniería Julio Garavito construida con **NestJS 11**, **Prisma ORM multi-base de datos** y autenticación dual **Microsoft Entra ID (Azure AD) + JWT**.

---

## 🚀 Características Principales

1. **Autenticación Dual (Azure AD + JWT)**:
   - Validación criptográfica de `id_token` emitido por Microsoft Entra ID usando las llaves públicas de Microsoft (JWKS con caché en memoria).
   - Verificación de Tenant ID institucional y Client IDs autorizados.
   - Generación de token JWT de sesión para el frontend.
   - Decorador `@Payload()` para extraer claims del usuario autenticado en controladores.
   - Soporte de roles mediante `@Roles('admin', 'docente', 'estudiante')` y `RolesGuard`.
   - Endpoint simulado `/api/auth/dev-login` para pruebas rápidas en local sin depender de Azure en vivo.

2. **Soporte Modular Multi-Base de Datos con Prisma**:
   - Conexión genérica y desacoplada a 1, 2 o 3 bases de datos según las necesidades del proyecto:
     - **DB-1 (Principal)**: Tablas del sistema (`Usuario`, etc.) usando `DATABASE_URL`.
     - **DB-2 (Opcional)**: Segunda base de datos usando `DATABASE_URL_DB2`.
     - **DB-3 (Opcional)**: Tercera base de datos usando `DATABASE_URL_DB3`.
   - Servicios Prisma independientes e inyectables (`PrimaryPrismaService`, `Db2PrismaService`, `Db3PrismaService`).
   - Esquemas limpios sin modelos de negocio falsos o acoplados.

3. **Arquitectura Limpia y DX**:
   - Documentación interactiva Swagger en `/docs`.
   - Validación automática de DTOs con `class-validator`.
   - Configuración CORS dinámica desde `CORS_ORIGINS`.
   - Cierre limpio de conexiones (`enableShutdownHooks`).
   - Dependencias estrictamente necesarias sin librerías pesadas no utilizadas.

---

## 📦 Instalación y Configuración

### 1. Variables de Entorno

Copia el archivo `.env.example` a `.env.development`:

```bash
cp .env.example .env.development
```

Ajusta los valores de conexión:
```env
PORT=3001
NODE_ENV=development
JWT_SECRET=super_secret_jwt_key_eci_change_in_production_xyz123
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

AZURE_AD_TENANT_ID=50640584-2a40-4216-a84b-9b3ee0f3f6cf
AZURE_AD_CLIENT_IDS=6e41c1c3-0c43-46b5-8e8b-f6c9b02729d6,86478c0e-05d8-480c-9798-767a09554661

# Base de Datos 1 (Principal)
DATABASE_URL="sqlserver://localhost:1433;database=mi_proyecto_db;user=sa;password=TuPassword;encrypt=true;trustServerCertificate=true"

# Base de Datos 2 (Si tu proyecto usa 2 o más BDs)
DATABASE_URL_DB2="sqlserver://localhost:1433;database=mi_proyecto_db2;user=sa;password=TuPassword;encrypt=true;trustServerCertificate=true"

# Base de Datos 3 (Si tu proyecto usa 3 BDs)
DATABASE_URL_DB3="sqlserver://localhost:1433;database=mi_proyecto_db3;user=sa;password=TuPassword;encrypt=true;trustServerCertificate=true"
```

### 2. Instalar dependencias y generar clientes Prisma

```bash
npm install
npm run prisma:generate
```

### 3. Iniciar el servidor

```bash
# Modo desarrollo con recarga en caliente
npm run start:dev

# Compilar para producción
npm run build
npm run start:prod
```

Visita Swagger en: [http://localhost:3001/docs](http://localhost:3001/docs)

---

## 🗄️ Estructura del Proyecto

```
src/
├── app.controller.ts           # Endpoint de salud (Health Check)
├── app.module.ts               # Módulo raíz
├── app.service.ts
├── main.ts                     # Entrada, Swagger, CORS y validación
├── auth/
│   ├── auth.controller.ts       # Endpoints de login y perfil
│   ├── auth.guard.ts            # JwtAuthGuard con soporte @Public()
│   ├── auth.module.ts           # Módulo JWT y Passport
│   ├── auth.service.ts          # Generación y verificación de tokens
│   ├── azure-token.service.ts   # Validador nativo de id_token de Azure AD
│   ├── JwtStrategy.ts           # Estrategia Passport JWT Bearer
│   ├── payload.decorator.ts     # Decorador @Payload()
│   ├── roles.decorator.ts       # Decorador @Roles()
│   ├── roles.guard.ts           # Guard de autorización por rol
│   └── dto/
├── database/
│   ├── primary-prisma.service.ts   # Conexión DB-1 (Principal)
│   ├── db2-prisma.service.ts       # Conexión DB-2 (Secundaria)
│   ├── db3-prisma.service.ts       # Conexión DB-3 (Terciaria)
│   └── database.module.ts          # Módulo global de base de datos
└── users/
    ├── users.controller.ts
    ├── users.module.ts
    └── users.service.ts
```
