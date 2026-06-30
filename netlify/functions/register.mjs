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
  if (event.httpMethod === 'OPTIONS') {
    return json(200, { ok: true })
  }

  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' })
  }

  try {
    const payload = JSON.parse(event.body || '{}')

    const fullName = String(payload.fullName || '').trim()
    const cpfRaw = String(payload.cpf || '')
    const cpf = onlyDigits(cpfRaw)
    const emailRaw = String(payload.email || '').trim().toLowerCase()
    const phoneRaw = String(payload.phone || '').trim()
    const cep = String(payload.cep || '').trim()
    const city = String(payload.city || '').trim()
    const studentCode = String(payload.studentCode || '').trim()
    const college = String(payload.college || '').trim()
    const course = String(payload.course || '').trim()
    const passwordRaw = String(payload.password || '').trim()
    const dependentsCount = Number(payload.dependentsCount || 0)

    const isStudentFlow = Boolean(college || course)
    const email = emailRaw || `cadastro.${cpf}@euplus.local`
    const phone = phoneRaw || '00000000000'

    if (!fullName || cpf.length !== 11) {
      return json(400, {
        error: 'Dados obrigatórios inválidos. Informe nome completo e CPF válido.',
      })
    }

    if (isStudentFlow && (!college || !course || !studentCode)) {
      return json(400, {
        error: 'Para cadastro de estudante, informe faculdade, curso e código do estudante.',
      })
    }
    const storedPassword = passwordRaw || 'NO_AUTH'

    const result = await query(
      `
      INSERT INTO registrations (
        full_name, cpf, email, phone, cep, city, student_code, college, course, password, dependents_count, status
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'ATIVO')
      ON CONFLICT (cpf)
      DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        cep = EXCLUDED.cep,
        city = EXCLUDED.city,
        student_code = EXCLUDED.student_code,
        college = EXCLUDED.college,
        course = EXCLUDED.course,
        password = EXCLUDED.password,
        dependents_count = EXCLUDED.dependents_count
      RETURNING id, cpf, status, created_at, updated_at;
      `,
      [
        fullName,
        cpf,
        email,
        phone,
        cep || null,
        city || null,
        studentCode || null,
        college || null,
        course || null,
        storedPassword,
        Number.isFinite(dependentsCount) ? dependentsCount : 0,
      ],
    )

    return json(200, {
      ok: true,
      message: 'Cadastro salvo com sucesso.',
      registration: result.rows[0],
    })
  } catch (error) {
    console.error('register error', error)
    return json(500, { error: 'Erro ao salvar cadastro.' })
  }
}
