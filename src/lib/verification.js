import crypto from 'crypto';
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

/**
 * Genera un token de verificación único
 */
export function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Crea un token de verificación para un usuario
 * @param {number} memberId - ID del miembro
 * @returns {Promise<string>} Token generado
 */
export async function createVerificationToken(memberId) {
  const token = generateVerificationToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

  await sql`
    UPDATE members
    SET verification_token = ${token},
        verification_token_expires = ${expiresAt.toISOString()}
    WHERE id = ${memberId}
  `;

  return token;
}

/**
 * Verifica un token y marca el email como verificado
 * @param {string} token - Token de verificación
 * @returns {Promise<Object|null>} Usuario verificado o null si token inválido
 */
export async function verifyEmailToken(token) {
  const [member] = await sql`
    SELECT * FROM members
    WHERE verification_token = ${token}
      AND verification_token_expires > NOW()
  `;

  if (!member) {
    return null;
  }

  // Marcar email como verificado
  await sql`
    UPDATE members
    SET email_verified = true,
        verification_token = NULL,
        verification_token_expires = NULL
    WHERE id = ${member.id}
  `;

  return member;
}

/**
 * Verifica si un usuario tiene su email verificado
 * @param {string} discordId - ID de Discord del usuario
 * @returns {Promise<boolean>}
 */
export async function isEmailVerified(discordId) {
  const [member] = await sql`
    SELECT email_verified, email
    FROM members
    WHERE discord_id = ${discordId}
  `;

  if (!member) {
    return false;
  }

  // Si no tiene email o no está verificado
  if (!member.email || !member.email_verified) {
    return false;
  }

  return true;
}

/**
 * Obtiene el miembro por Discord ID
 * @param {string} discordId
 * @returns {Promise<Object|null>}
 */
export async function getMemberByDiscordId(discordId) {
  const [member] = await sql`
    SELECT * FROM members
    WHERE discord_id = ${discordId}
  `;

  return member || null;
}
