import { query } from './_db.mjs'

const MAX_DEPENDENTS = 3

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  },
  body: JSON.stringify(body),
})

const onlyDigits = (value = '') => value.replace(/\D/g, '')

const mapStudent = (row) => ({
  id: `stu-${row.id}`,
  dbId: row.id,
  name: row.full_name,
  cpf: row.cpf,
  email: row.email,
  phone: row.phone || '',
  city: row.city || '',
  status: row.status || 'PENDENTE',
  economyYtd: Number(row.economy_ytd || 0),
  projected5y: Number(row.projected_5y || 30000),
  createdAt: row.created_at ? String(row.created_at).slice(0, 10) : '',
})

const mapPartner = (row) => ({
  id: `prt-${row.id}`,
  dbId: row.id,
  name: row.name,
  cnpj: row.cnpj,
  category: row.category,
  phone: row.phone || '',
  address: row.address || '',
  city: row.city || '',
  region: row.region,
  lat: Number(row.lat || 0),
  lng: Number(row.lng || 0),
  status: row.status,
  showOnMap: Boolean(row.show_on_map),
  showOnOffers: Boolean(row.show_on_offers),
  logo: row.logo || '',
  createdAt: row.created_at ? String(row.created_at).slice(0, 10) : '',
})

const mapOffer = (row) => ({
  id: `ofr-${row.id}`,
  dbId: row.id,
  partnerId: `prt-${row.partner_id}`,
  title: row.title,
  description: row.description || '',
  discount: Number(row.discount || 0),
  validUntil: row.valid_until ? String(row.valid_until).slice(0, 10) : '',
  status: row.status,
  image: row.image || '',
})

const mapLog = (row) => ({
  id: `log-${row.id}`,
  dbId: row.id,
  actor: row.actor,
  action: row.action,
  target: row.target,
  createdAt: row.created_at ? String(row.created_at).slice(0, 16).replace('T', ' ') : '',
})

async function getDashboardData() {
  const [studentsRes, vidaRes, dependentsRes, partnersRes, offersRes, logsRes] = await Promise.all([
    query(
      `
      SELECT id, full_name, cpf, email, phone, city, status, economy_ytd, projected_5y, created_at
      FROM registrations
      ORDER BY created_at DESC;
      `,
    ),
    query(
      `
      SELECT id, full_name, cpf, email, phone, cep, city, student_code, status, created_at
      FROM vida_accounts
      ORDER BY created_at DESC;
      `,
    ),
    query(
      `
      SELECT id, vida_account_id, name, cpf
      FROM vida_dependents
      ORDER BY id DESC;
      `,
    ),
    query(
      `
      SELECT id, name, cnpj, category, phone, address, city, region, lat, lng, status, show_on_map, show_on_offers, logo, created_at
      FROM partners
      ORDER BY created_at DESC;
      `,
    ),
    query(
      `
      SELECT id, partner_id, title, description, discount, valid_until, status, image
      FROM offers
      ORDER BY created_at DESC;
      `,
    ),
    query(
      `
      SELECT id, actor, action, target, created_at
      FROM audit_logs
      ORDER BY created_at DESC
      LIMIT 100;
      `,
    ),
  ])

  const dependentsByVida = dependentsRes.rows.reduce((acc, row) => {
    const key = String(row.vida_account_id)
    if (!acc[key]) acc[key] = []
    acc[key].push({
      id: `dep-${row.id}`,
      dbId: row.id,
      name: row.name,
      cpf: row.cpf || '',
    })
    return acc
  }, {})

  const students = studentsRes.rows.map(mapStudent)
  const vidas = vidaRes.rows.map((row) => ({
    id: `usr-${row.id}`,
    dbId: row.id,
    fullName: row.full_name,
    cpf: row.cpf,
    email: row.email,
    phone: row.phone || '',
    cep: row.cep || '',
    city: row.city || '',
    studentCode: row.student_code || '',
    status: row.status || 'PENDENTE',
    dependents: dependentsByVida[String(row.id)] || [],
    createdAt: row.created_at ? String(row.created_at).slice(0, 10) : '',
  }))

  return {
    students,
    vidas,
    partners: partnersRes.rows.map(mapPartner),
    offers: offersRes.rows.map(mapOffer),
    auditLogs: logsRes.rows.map(mapLog),
  }
}

async function pushAudit(actor, action, target) {
  await query(`INSERT INTO audit_logs (actor, action, target) VALUES ($1,$2,$3);`, [actor, action, target])
}

export async function handler(event) {
  try {
    if (event.httpMethod === 'OPTIONS') {
      return json(200, { ok: true })
    }

    if (event.httpMethod === 'GET') {
      const data = await getDashboardData()
      return json(200, { ok: true, ...data })
    }

    if (event.httpMethod !== 'POST') {
      return json(405, { error: 'Method not allowed' })
    }

    const payload = JSON.parse(event.body || '{}')
    const action = String(payload.action || '')

    if (action === 'adminLogin') {
      const email = String(payload.email || '').trim().toLowerCase()
      const password = String(payload.password || '')
      const result = await query(
        `SELECT id, name, email, role FROM admin_users WHERE lower(email)= $1 AND password = $2 LIMIT 1;`,
        [email, password],
      )
      if (!result.rowCount) return json(401, { error: 'Credenciais administrativas inválidas.' })
      return json(200, { ok: true, admin: result.rows[0] })
    }

    if (action === 'createStudent') {
      const fullName = String(payload.name || '').trim()
      const cpf = onlyDigits(payload.cpf || '')
      const email = String(payload.email || '').trim().toLowerCase()
      const phone = String(payload.phone || '').trim()
      const city = String(payload.city || '').trim()
      const status = String(payload.status || 'PENDENTE')
      if (!fullName || cpf.length !== 11 || !email || !phone) {
        return json(400, { error: 'Informe nome, CPF válido, e-mail e telefone.' })
      }
      await query(
        `
        INSERT INTO registrations (full_name, cpf, email, phone, city, status, password)
        VALUES ($1,$2,$3,$4,$5,$6,'NO_AUTH')
        ON CONFLICT (cpf) DO UPDATE SET
          full_name = EXCLUDED.full_name,
          email = EXCLUDED.email,
          phone = EXCLUDED.phone,
          city = EXCLUDED.city,
          status = EXCLUDED.status;
        `,
        [fullName, cpf, email, phone || null, city || null, status],
      )
      await pushAudit(String(payload.actor || 'Admin Euplus'), 'Criou aluno', fullName)
      return json(200, { ok: true })
    }

    if (action === 'updateStudentStatus') {
      const id = Number(String(payload.id || '').replace('stu-', ''))
      const status = String(payload.status || '')
      if (!Number.isFinite(id) || !status) return json(400, { error: 'Dados inválidos.' })
      const result = await query(`UPDATE registrations SET status = $1 WHERE id = $2 RETURNING full_name;`, [status, id])
      if (!result.rowCount) return json(404, { error: 'Aluno não encontrado.' })
      await pushAudit(String(payload.actor || 'Admin Euplus'), 'Atualizou status', `${result.rows[0].full_name} para ${status}`)
      return json(200, { ok: true })
    }

    if (action === 'createVida') {
      const fullName = String(payload.fullName || '').trim()
      const cpf = onlyDigits(payload.cpf || '')
      const email = String(payload.email || '').trim().toLowerCase()
      const phone = String(payload.phone || '').trim()
      const cep = String(payload.cep || '').trim()
      const city = String(payload.city || '').trim()
      const studentCode = String(payload.studentCode || '').trim()
      const status = String(payload.status || 'PENDENTE')
      const dependents = Array.isArray(payload.dependents) ? payload.dependents : []
      if (!fullName || cpf.length !== 11 || !email) {
        return json(400, { error: 'Informe nome, CPF válido e e-mail.' })
      }

      const created = await query(
        `
        INSERT INTO vida_accounts (full_name, cpf, email, phone, cep, city, student_code, password, status)
        VALUES ($1,$2,$3,$4,$5,$6,$7,'NO_AUTH',$8)
        RETURNING id;
        `,
        [fullName, cpf, email, phone || null, cep || null, city || null, studentCode || null, status],
      )

      const vidaId = created.rows[0].id
      for (const dep of dependents.slice(0, MAX_DEPENDENTS)) {
        const depName = String(dep.name || '').trim()
        if (!depName) continue
        const depCpf = onlyDigits(dep.cpf || '')
        await query(`INSERT INTO vida_dependents (vida_account_id, name, cpf) VALUES ($1,$2,$3);`, [
          vidaId,
          depName,
          depCpf || null,
        ])
      }
      await pushAudit(String(payload.actor || 'Admin Euplus'), 'Criou Vida', fullName)
      return json(200, { ok: true })
    }

    if (action === 'updateVidaStatus') {
      const id = Number(String(payload.id || '').replace('usr-', ''))
      const status = String(payload.status || '')
      if (!Number.isFinite(id) || !status) return json(400, { error: 'Dados inválidos.' })
      const result = await query(`UPDATE vida_accounts SET status = $1 WHERE id = $2 RETURNING full_name;`, [status, id])
      if (!result.rowCount) return json(404, { error: 'Vida não encontrado.' })
      await pushAudit(String(payload.actor || 'Admin Euplus'), 'Atualizou status de Vida', `${result.rows[0].full_name} para ${status}`)
      return json(200, { ok: true })
    }

    if (action === 'savePartner') {
      const partner = payload.partner || {}
      const id = Number(String(partner.id || '').replace('prt-', '')) || null
      const cnpj = String(partner.cnpj || '').trim()
      if (!partner.name || !cnpj) return json(400, { error: 'Nome e CNPJ são obrigatórios.' })

      if (id) {
        await query(
          `
          UPDATE partners
          SET name=$1, cnpj=$2, category=$3, phone=$4, address=$5, city=$6, region=$7, lat=$8, lng=$9,
              status=$10, show_on_map=$11, show_on_offers=$12, logo=$13
          WHERE id=$14;
          `,
          [
            partner.name,
            cnpj,
            partner.category || '',
            partner.phone || null,
            partner.address || null,
            partner.city || null,
            partner.region || 'UNASP',
            Number(partner.lat || 0),
            Number(partner.lng || 0),
            partner.status || 'ATIVO',
            Boolean(partner.showOnMap),
            Boolean(partner.showOnOffers),
            partner.logo || null,
            id,
          ],
        )
        await pushAudit(String(payload.actor || 'Admin Euplus'), 'Atualizou parceiro', String(partner.name))
      } else {
        await query(
          `
          INSERT INTO partners (name, cnpj, category, phone, address, city, region, lat, lng, status, show_on_map, show_on_offers, logo)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13);
          `,
          [
            partner.name,
            cnpj,
            partner.category || '',
            partner.phone || null,
            partner.address || null,
            partner.city || null,
            partner.region || 'UNASP',
            Number(partner.lat || 0),
            Number(partner.lng || 0),
            partner.status || 'ATIVO',
            Boolean(partner.showOnMap),
            Boolean(partner.showOnOffers),
            partner.logo || null,
          ],
        )
        await pushAudit(String(payload.actor || 'Admin Euplus'), 'Criou parceiro', String(partner.name))
      }
      return json(200, { ok: true })
    }

    if (action === 'saveOffer') {
      const offer = payload.offer || {}
      const id = Number(String(offer.id || '').replace('ofr-', '')) || null
      const partnerId = Number(String(offer.partnerId || '').replace('prt-', ''))
      if (!offer.title || !partnerId) return json(400, { error: 'Parceiro e título são obrigatórios.' })

      if (id) {
        await query(
          `
          UPDATE offers
          SET partner_id=$1, title=$2, description=$3, discount=$4, valid_until=$5, status=$6, image=$7
          WHERE id=$8;
          `,
          [
            partnerId,
            offer.title,
            offer.description || null,
            Number(offer.discount || 0),
            offer.validUntil || null,
            offer.status || 'ATIVA',
            offer.image || null,
            id,
          ],
        )
        await pushAudit(String(payload.actor || 'Admin Euplus'), 'Atualizou oferta', String(offer.title))
      } else {
        await query(
          `
          INSERT INTO offers (partner_id, title, description, discount, valid_until, status, image)
          VALUES ($1,$2,$3,$4,$5,$6,$7);
          `,
          [
            partnerId,
            offer.title,
            offer.description || null,
            Number(offer.discount || 0),
            offer.validUntil || null,
            offer.status || 'ATIVA',
            offer.image || null,
          ],
        )
        await pushAudit(String(payload.actor || 'Admin Euplus'), 'Criou oferta', String(offer.title))
      }
      return json(200, { ok: true })
    }

    return json(400, { error: 'Ação inválida.' })
  } catch (error) {
    console.error('dashboard error', error)
    return json(500, { error: 'Erro interno no dashboard.' })
  }
}
