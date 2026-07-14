import { createHmac, timingSafeEqual, randomBytes, scryptSync } from 'node:crypto'

// Tudo aqui usa só node:crypto — sem JWT lib, sem bcrypt.
const SECRET = process.env.ADMIN_TOKEN_SECRET
const TOKEN_TTL_MS = 8 * 60 * 60 * 1000

export const isAuthConfigured = () => Boolean(SECRET)

const sign = (body) => createHmac('sha256', SECRET).update(body).digest('base64url')

// Comparação em tempo constante: um === vaza a assinatura por timing.
const safeEqual = (a, b) => {
  const bufA = Buffer.from(String(a))
  const bufB = Buffer.from(String(b))
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

/**
 * Token = `<id>.<nome em base64url>.<expiração>.<assinatura HMAC>`
 * O nome viaja dentro do token assinado para o audit log não depender
 * de um campo `actor` que o cliente pode forjar.
 */
export function issueAdminToken(admin) {
  if (!SECRET) throw new Error('ADMIN_TOKEN_SECRET não está configurado')
  const name = Buffer.from(String(admin.name || 'Admin')).toString('base64url')
  const body = `${admin.id}.${name}.${Date.now() + TOKEN_TTL_MS}`
  return `${body}.${sign(body)}`
}

/** Retorna { id, name } se o token for válido e não expirado; senão null. */
export function verifyAdmin(event) {
  if (!SECRET) return null
  const header = event.headers?.authorization || event.headers?.Authorization || ''
  if (!header.startsWith('Bearer ')) return null

  const parts = header.slice(7).split('.')
  if (parts.length !== 4) return null

  const [id, name, exp, sig] = parts
  if (!safeEqual(sig, sign(`${id}.${name}.${exp}`))) return null
  if (!Number(exp) || Number(exp) < Date.now()) return null

  return { id, name: Buffer.from(name, 'base64url').toString('utf8') }
}

export function hashPassword(plain) {
  const salt = randomBytes(16).toString('hex')
  return `scrypt$${salt}$${scryptSync(plain, salt, 64).toString('hex')}`
}

/**
 * Aceita o formato novo (scrypt$…) e o legado (texto puro), para não
 * deslogar ninguém na virada. `needsRehash` sinaliza quem ainda está no legado.
 */
export function verifyPassword(plain, stored) {
  if (!stored || !plain) return { ok: false, needsRehash: false }

  if (!String(stored).startsWith('scrypt$')) {
    const ok = safeEqual(stored, plain)
    return { ok, needsRehash: ok }
  }

  const [, salt, hash] = String(stored).split('$')
  if (!salt || !hash) return { ok: false, needsRehash: false }
  return { ok: safeEqual(scryptSync(plain, salt, 64).toString('hex'), hash), needsRehash: false }
}
