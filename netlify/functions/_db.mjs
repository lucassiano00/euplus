import pg from 'pg'
import { hashPassword } from './_auth.mjs'

const { Pool } = pg

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not configured')
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

let initialized = false
let initPromise = null

export async function query(text, params = []) {
  if (!initialized) {
    if (!initPromise) {
      initPromise = (async () => {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'owner',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS registrations (
        id BIGSERIAL PRIMARY KEY,
        full_name TEXT NOT NULL,
        cpf TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        cep TEXT,
        city TEXT,
        student_code TEXT,
        college TEXT,
        course TEXT,
        password TEXT NOT NULL DEFAULT '123456',
        dependents_count INTEGER NOT NULL DEFAULT 0,
        economy_ytd NUMERIC(12,2) NOT NULL DEFAULT 0,
        projected_5y NUMERIC(12,2) NOT NULL DEFAULT 30000,
        status TEXT NOT NULL DEFAULT 'PENDENTE',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `)

    await pool.query(`
      ALTER TABLE registrations
      ADD COLUMN IF NOT EXISTS password TEXT NOT NULL DEFAULT '123456';
    `)
    await pool.query(`
      ALTER TABLE registrations
      ADD COLUMN IF NOT EXISTS economy_ytd NUMERIC(12,2) NOT NULL DEFAULT 0;
    `)
    await pool.query(`
      ALTER TABLE registrations
      ADD COLUMN IF NOT EXISTS projected_5y NUMERIC(12,2) NOT NULL DEFAULT 30000;
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS vida_accounts (
        id BIGSERIAL PRIMARY KEY,
        full_name TEXT NOT NULL,
        cpf TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        phone TEXT,
        cep TEXT,
        city TEXT,
        student_code TEXT,
        password TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'PENDENTE',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS vida_dependents (
        id BIGSERIAL PRIMARY KEY,
        vida_account_id BIGINT NOT NULL REFERENCES vida_accounts(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        cpf TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS partners (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        cnpj TEXT NOT NULL UNIQUE,
        category TEXT NOT NULL,
        phone TEXT,
        address TEXT,
        city TEXT,
        region TEXT NOT NULL,
        lat DOUBLE PRECISION NOT NULL DEFAULT 0,
        lng DOUBLE PRECISION NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'ATIVO',
        show_on_map BOOLEAN NOT NULL DEFAULT TRUE,
        show_on_offers BOOLEAN NOT NULL DEFAULT TRUE,
        logo TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS offers (
        id BIGSERIAL PRIMARY KEY,
        partner_id BIGINT NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        discount NUMERIC(5,2) NOT NULL DEFAULT 0,
        valid_until DATE,
        status TEXT NOT NULL DEFAULT 'ATIVA',
        image TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id BIGSERIAL PRIMARY KEY,
        actor TEXT NOT NULL,
        action TEXT NOT NULL,
        target TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `)

    await pool.query(`
      CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `)

    await pool.query(`
      DROP TRIGGER IF EXISTS trg_set_updated_at_registrations ON registrations;
      CREATE TRIGGER trg_set_updated_at_registrations
      BEFORE UPDATE ON registrations
      FOR EACH ROW
      EXECUTE FUNCTION set_updated_at_timestamp();
    `)
    await pool.query(`
      DROP TRIGGER IF EXISTS trg_set_updated_at_admin_users ON admin_users;
      CREATE TRIGGER trg_set_updated_at_admin_users
      BEFORE UPDATE ON admin_users
      FOR EACH ROW
      EXECUTE FUNCTION set_updated_at_timestamp();
    `)
    await pool.query(`
      DROP TRIGGER IF EXISTS trg_set_updated_at_vida_accounts ON vida_accounts;
      CREATE TRIGGER trg_set_updated_at_vida_accounts
      BEFORE UPDATE ON vida_accounts
      FOR EACH ROW
      EXECUTE FUNCTION set_updated_at_timestamp();
    `)
    await pool.query(`
      DROP TRIGGER IF EXISTS trg_set_updated_at_partners ON partners;
      CREATE TRIGGER trg_set_updated_at_partners
      BEFORE UPDATE ON partners
      FOR EACH ROW
      EXECUTE FUNCTION set_updated_at_timestamp();
    `)
    await pool.query(`
      DROP TRIGGER IF EXISTS trg_set_updated_at_offers ON offers;
      CREATE TRIGGER trg_set_updated_at_offers
      BEFORE UPDATE ON offers
      FOR EACH ROW
      EXECUTE FUNCTION set_updated_at_timestamp();
    `)

    // Admin seed credentials come from environment variables — never hardcode them.
    // Set ADMIN_SEED_PASSWORD (and optionally ADMIN_SEED_EMAIL) in the Netlify env.
    // When ADMIN_SEED_PASSWORD is unset, the seed is skipped so no default password is created.
    const adminEmail = process.env.ADMIN_SEED_EMAIL || 'admin@euplus.com.br'
    const adminPassword = process.env.ADMIN_SEED_PASSWORD
    if (adminPassword) {
      await pool.query(
        `
        INSERT INTO admin_users (name, email, password, role)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (email) DO UPDATE
        SET
          name = EXCLUDED.name,
          password = EXCLUDED.password,
          role = EXCLUDED.role;
        `,
        ['Admin Euplus', adminEmail, hashPassword(adminPassword), 'owner'],
      )
    }

    initialized = true
      })().finally(() => {
        initPromise = null
      })
    }
    await initPromise
  }

  return pool.query(text, params)
}
