import { query } from './_db.mjs'

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
  },
  body: JSON.stringify(body),
})

const onlyDigits = (value = '') => value.replace(/\D/g, '')

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return json(200, { ok: true })
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' })

  try {
    const payload = JSON.parse(event.body || '{}')
    const cpf = onlyDigits(String(payload.cpf || ''))
    const password = String(payload.password || '')

    if (cpf.length !== 11 || !password) {
      return json(400, { error: 'Informe CPF e senha válidos.' })
    }

    const result = await query(
      `
      SELECT id, full_name, cpf, email, phone, city, status
      FROM registrations
      WHERE cpf = $1 AND password = $2
      LIMIT 1;
      `,
      [cpf, password],
    )

    if (!result.rowCount) {
      return json(401, { error: 'CPF ou senha inválidos.' })
    }

    const user = result.rows[0]
    return json(200, {
      ok: true,
      user: {
        id: `usr-${user.id}`,
        fullName: user.full_name,
        cpf: user.cpf,
        email: user.email || '',
        phone: user.phone || '',
        city: user.city || '',
        status: user.status || 'PENDENTE',
      },
    })
  } catch (error) {
    console.error('auth-login error', error)
    return json(500, { error: 'Não foi possível conectar ao servidor.' })
  }
}
