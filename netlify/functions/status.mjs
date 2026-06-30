import { query } from './_db.mjs'

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
  },
  body: JSON.stringify(body),
})

const onlyDigits = (value = '') => value.replace(/\D/g, '')

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return json(200, { ok: true })
  }

  if (event.httpMethod !== 'GET') {
    return json(405, { error: 'Method not allowed' })
  }

  try {
    const cpf = onlyDigits(event.queryStringParameters?.cpf || '')

    if (cpf.length !== 11) {
      return json(400, { error: 'Informe um CPF válido com 11 dígitos.' })
    }

    const studentResult = await query(
      `
      SELECT id, cpf, full_name, status, created_at, updated_at
      FROM registrations
      WHERE cpf = $1
      LIMIT 1;
      `,
      [cpf],
    )

    if (studentResult.rowCount) {
      return json(200, {
        ok: true,
        registration: {
          ...studentResult.rows[0],
          source: 'registration',
        },
      })
    }

    const vidaResult = await query(
      `
      SELECT id, cpf, full_name, status, created_at, updated_at
      FROM vida_accounts
      WHERE cpf = $1
      LIMIT 1;
      `,
      [cpf],
    )

    if (vidaResult.rowCount) {
      return json(200, {
        ok: true,
        registration: {
          ...vidaResult.rows[0],
          source: 'vida',
        },
      })
    }

    const dependentResult = await query(
      `
      SELECT
        vd.id AS dependent_id,
        vd.cpf,
        vd.name AS dependent_name,
        va.id AS vida_id,
        va.full_name,
        va.status,
        va.created_at,
        va.updated_at
      FROM vida_dependents vd
      INNER JOIN vida_accounts va ON va.id = vd.vida_account_id
      WHERE vd.cpf = $1
      LIMIT 1;
      `,
      [cpf],
    )

    if (dependentResult.rowCount) {
      const dependent = dependentResult.rows[0]
      return json(200, {
        ok: true,
        registration: {
          id: dependent.vida_id,
          cpf: dependent.cpf,
          full_name: dependent.dependent_name,
          status: dependent.status,
          created_at: dependent.created_at,
          updated_at: dependent.updated_at,
          source: 'vida-dependent',
          owner_name: dependent.full_name,
        },
      })
    }

    return json(404, { error: 'Cadastro não encontrado para este CPF.' })
  } catch (error) {
    console.error('status error', error)
    return json(500, { error: 'Erro ao consultar status.' })
  }
}
