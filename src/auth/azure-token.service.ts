import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createPublicKey, verify, JsonWebKey } from 'crypto';

interface AzureIdTokenClaims {
  iss: string;
  aud: string;
  tid: string;
  exp: number;
  nbf?: number;
  preferred_username?: string;
  email?: string;
  name?: string;
  oid?: string;
}

interface Jwk extends JsonWebKey {
  kid?: string;
}

const JWKS_TTL_MS = 60 * 60 * 1000; // 1 hora de caché
const CLOCK_SKEW_SECONDS = 60; // 60 segundos de tolerancia de reloj

/**
 * Valida los id_token emitidos por Microsoft Entra ID (Azure AD) para el tenant institucional de la ECI.
 * Verifica firma criptográfica (JWKS público de Microsoft), tenant, emisor, audiencia y vigencia.
 */
@Injectable()
export class AzureTokenService {
  private readonly logger = new Logger(AzureTokenService.name);
  private jwksCache: { keys: Jwk[]; fetchedAt: number } | null = null;

  constructor(private readonly configService: ConfigService) {}

  async verifyIdToken(idToken: string): Promise<{ correo: string; oid?: string; name?: string }> {
    const tenantId = this.configService.get<string>('AZURE_AD_TENANT_ID');
    const clientIds = (this.configService.get<string>('AZURE_AD_CLIENT_IDS') ?? '')
      .split(',')
      .map((id) => id.trim().toLowerCase())
      .filter(Boolean);

    if (!tenantId || clientIds.length === 0) {
      this.logger.error('Configuración de Azure AD incompleta en variables de entorno');
      throw new UnauthorizedException('Configuración de Azure AD incompleta');
    }

    const [headerB64, payloadB64, signatureB64, ...extra] = (idToken || '').split('.');
    if (!headerB64 || !payloadB64 || !signatureB64 || extra.length > 0) {
      throw new UnauthorizedException('Token inválido: formato JWT incorrecto');
    }

    let header: { alg?: string; kid?: string };
    let claims: AzureIdTokenClaims;
    try {
      header = JSON.parse(Buffer.from(headerB64, 'base64url').toString('utf8'));
      claims = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    } catch {
      throw new UnauthorizedException('Token inválido: error al decodificar payload');
    }

    if (header.alg !== 'RS256' || !header.kid) {
      throw new UnauthorizedException('Token inválido: algoritmo o clave no permitidos');
    }

    const jwk = await this.getSigningKey(tenantId, header.kid);
    const firmaValida = verify(
      'RSA-SHA256',
      Buffer.from(`${headerB64}.${payloadB64}`),
      createPublicKey({ key: jwk, format: 'jwk' }),
      Buffer.from(signatureB64, 'base64url'),
    );

    if (!firmaValida) {
      throw new UnauthorizedException('Firma del token inválida');
    }

    const ahora = Math.floor(Date.now() / 1000);

    // Validación del Tenant e Issuer
    if (
      claims.tid?.toLowerCase() !== tenantId.toLowerCase() ||
      claims.iss !== `https://login.microsoftonline.com/${claims.tid}/v2.0`
    ) {
      throw new UnauthorizedException('Tenant o emisor no autorizado');
    }

    // Validación de la Audiencia (Client ID de la aplicación front registrada en Azure)
    if (!clientIds.includes((claims.aud ?? '').toLowerCase())) {
      throw new UnauthorizedException('Audiencia no autorizada');
    }

    // Validación de expiración y nbf
    if (
      !claims.exp ||
      claims.exp + CLOCK_SKEW_SECONDS < ahora ||
      (claims.nbf && claims.nbf - CLOCK_SKEW_SECONDS > ahora)
    ) {
      throw new UnauthorizedException('Token de Azure expirado');
    }

    // Priorizar claim email sobre preferred_username
    const correo = (claims.email || claims.preferred_username || '').trim().toLowerCase();
    if (!correo) {
      throw new UnauthorizedException('Correo electrónico no encontrado en el token de Azure');
    }

    return { correo, oid: claims.oid, name: claims.name };
  }

  private async getSigningKey(tenantId: string, kid: string): Promise<Jwk> {
    const buscar = (keys: Jwk[]) => keys.find((k) => k.kid === kid);

    if (this.jwksCache && Date.now() - this.jwksCache.fetchedAt < JWKS_TTL_MS) {
      const cacheada = buscar(this.jwksCache.keys);
      if (cacheada) return cacheada;
    }

    // Caché vencida o llave rotada: se consulta el endpoint de Microsoft
    try {
      const res = await fetch(`https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`);
      if (!res.ok) {
        throw new Error(`Respuesta HTTP ${res.status}`);
      }

      const { keys } = (await res.json()) as { keys: Jwk[] };
      this.jwksCache = { keys, fetchedAt: Date.now() };

      const jwk = buscar(keys);
      if (!jwk) throw new UnauthorizedException('Llave de firma de Azure desconocida');
      return jwk;
    } catch (error) {
      this.logger.error(`Error al obtener JWKS de Microsoft: ${error.message}`);
      throw new UnauthorizedException('No se pudieron verificar las llaves públicas de Microsoft');
    }
  }
}
