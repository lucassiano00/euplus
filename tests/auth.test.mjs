// Self-check do módulo de auth. Roda com: node netlify/functions/_auth.test.mjs
// Sem framework — o objetivo é falhar alto se a segurança regredir.
import assert from 'node:assert/strict'

process.env.ADMIN_TOKEN_SECRET = 'segredo-de-teste-bem-longo-123'
const { issueAdminToken, verifyAdmin, hashPassword, verifyPassword } = await import('../netlify/functions/_auth.mjs')

const bearer = (token) => ({ headers: { authorization: `Bearer ${token}` } })
const ADMIN = { id: 7, name: 'Admin Euplus' }

// --- token: round-trip ---
const token = issueAdminToken(ADMIN)
const ok = verifyAdmin(bearer(token))
assert.equal(ok?.id, '7', 'token válido deve devolver o id')
assert.equal(ok?.name, 'Admin Euplus', 'o nome deve vir do token, não do corpo do POST')

// --- token: rejeições ---
assert.equal(verifyAdmin({ headers: {} }), null, 'sem header -> null')
assert.equal(verifyAdmin({ headers: { authorization: token } }), null, 'sem "Bearer " -> null')
assert.equal(verifyAdmin(bearer('lixo')), null, 'token malformado -> null')

// assinatura adulterada
const [id, name, exp] = token.split('.')
assert.equal(verifyAdmin(bearer(`${id}.${name}.${exp}.assinaturafalsa`)), null, 'assinatura falsa -> null')

// escalar privilégio trocando o id, mantendo a assinatura antiga
assert.equal(verifyAdmin(bearer(`999.${name}.${exp}.${token.split('.')[3]}`)), null, 'id trocado -> null')

// esticar a expiração, mantendo a assinatura antiga
const futuro = Date.now() + 999_999_999
assert.equal(verifyAdmin(bearer(`${id}.${name}.${futuro}.${token.split('.')[3]}`)), null, 'exp esticada -> null')

// token expirado (assinado de verdade, mas vencido)
const { createHmac } = await import('node:crypto')
const corpoVencido = `7.${name}.${Date.now() - 1000}`
const sigVencida = createHmac('sha256', process.env.ADMIN_TOKEN_SECRET).update(corpoVencido).digest('base64url')
assert.equal(verifyAdmin(bearer(`${corpoVencido}.${sigVencida}`)), null, 'token expirado -> null')

// --- senha: hash novo ---
const stored = hashPassword('senha-forte')
assert.ok(stored.startsWith('scrypt$'), 'deve gravar no formato scrypt')
assert.ok(!stored.includes('senha-forte'), 'a senha em texto puro não pode sobrar no hash')
assert.deepEqual(verifyPassword('senha-forte', stored), { ok: true, needsRehash: false })
assert.equal(verifyPassword('senha-errada', stored).ok, false, 'senha errada -> false')

// --- senha: legado em texto puro (migração transparente) ---
assert.deepEqual(verifyPassword('Euplus@2026', 'Euplus@2026'), { ok: true, needsRehash: true }, 'legado válido -> pede rehash')
assert.equal(verifyPassword('errada', 'Euplus@2026').ok, false, 'legado com senha errada -> false')

// --- entradas vazias não podem passar ---
assert.equal(verifyPassword('', '').ok, false)
assert.equal(verifyPassword('x', null).ok, false)
assert.equal(verifyPassword('', stored).ok, false)

console.log('✓ _auth: todos os checks passaram')
