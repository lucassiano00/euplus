// Inativa os registros-semente de parceiros que duplicam entradas do fallbackPartners.
// Uso:  node scripts/inativar-parceiros-semente.mjs
// A senha é pedida no terminal (não fica em env, histórico do shell nem no código).
//
// Por que existe: prt-1/2/3 vieram do seed inicial, não têm telefone e renderizam
// card sem botão de contato ao lado do parceiro real. Ver ADR-0006 no vault.
import { createInterface } from 'node:readline/promises'
import { stdin, stdout } from 'node:process'

const BASE = process.env.EUPLUS_BASE || 'https://euplus.com.br/.netlify/functions'
const ALVOS = ['prt-1', 'prt-2', 'prt-3']

if (!stdin.isTTY) {
  console.error('Este script pede a senha no terminal — rode direto, sem pipe ou redirecionamento.')
  process.exit(1)
}

const rl = createInterface({ input: stdin, output: stdout })
const email = await rl.question('E-mail do admin: ')
rl.close()

// Raw mode pra ler a senha sem eco. readline não faz isso de forma confiável.
const lerSenha = () =>
  new Promise((resolve, reject) => {
    stdout.write('Senha: ')
    stdin.setRawMode(true)
    stdin.resume()
    stdin.setEncoding('utf8')
    let buffer = ''

    const encerrar = (fn, valor) => {
      stdin.setRawMode(false)
      stdin.pause()
      stdin.off('data', onData)
      stdout.write('\n')
      fn(valor)
    }

    const onData = (chunk) => {
      for (const char of chunk) {
        if (char === '\r' || char === '\n') return encerrar(resolve, buffer)
        if (char === '\x03') return encerrar(reject, new Error('cancelado')) // Ctrl-C
        if (char === '\x7f' || char === '\b') {
          buffer = buffer.slice(0, -1)
          continue
        }
        buffer += char
      }
    }

    stdin.on('data', onData)
  })

const senha = await lerSenha().catch(() => {
  console.error('\nCancelado.')
  process.exit(130)
})

const login = await fetch(`${BASE}/dashboard`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'adminLogin', email: email.trim(), password: senha }),
})
const auth = await login.json()
if (!login.ok || !auth.token) {
  console.error(`✗ Login falhou (HTTP ${login.status}): ${auth.error || 'sem token'}`)
  process.exit(1)
}
console.log(`✓ Autenticado como ${auth.admin.name}\n`)

// savePartner faz UPDATE de todos os campos, então precisamos do registro atual
// pra não zerar nada — só o status muda.
const atuais = await fetch(`${BASE}/dashboard`, {
  headers: { Authorization: `Bearer ${auth.token}` },
}).then((r) => r.json())

let feitos = 0
for (const id of ALVOS) {
  const parceiro = atuais.partners?.find((p) => p.id === id)
  if (!parceiro) {
    console.log(`- ${id}: não encontrado, pulando`)
    continue
  }
  if (parceiro.status === 'INATIVO') {
    console.log(`- ${id} (${parceiro.name}): já estava INATIVO`)
    continue
  }

  const res = await fetch(`${BASE}/dashboard`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
    body: JSON.stringify({ action: 'savePartner', partner: { ...parceiro, status: 'INATIVO' } }),
  })
  const body = await res.json()
  if (res.ok && body.ok) {
    console.log(`✓ ${id} (${parceiro.name}) → INATIVO`)
    feitos++
  } else {
    console.error(`✗ ${id}: ${body.error || `HTTP ${res.status}`}`)
  }
}

console.log(`\n${feitos} parceiro(s) inativado(s). Recarregue https://euplus.com.br para conferir.`)
