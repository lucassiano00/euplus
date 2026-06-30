export type StudentStatus = 'ATIVO' | 'INATIVO' | 'PENDENTE' | 'BLOQUEADO'
export type PartnerStatus = 'ATIVO' | 'INATIVO'
export type OfferStatus = 'ATIVA' | 'PAUSADA' | 'ENCERRADA'

export type Region = 'UNASP' | 'UNIAENE' | 'IAP'

export type StudentRecord = {
  id: string
  name: string
  cpf: string
  email: string
  phone: string
  city: string
  status: StudentStatus
  economyYtd: number
  projected5y: number
  createdAt: string
  password: string
}

export type AdminRole = 'owner' | 'operador' | 'suporte'

export type AdminUser = {
  id: string
  name: string
  email: string
  role: AdminRole
  password: string
}

export type PartnerRecord = {
  id: string
  name: string
  cnpj: string
  category: string
  phone: string
  address: string
  city: string
  region: Region
  lat: number
  lng: number
  status: PartnerStatus
  showOnMap: boolean
  showOnOffers: boolean
  logo: string
  createdAt?: string
}

export type OfferRecord = {
  id: string
  partnerId: string
  title: string
  description: string
  discount: number
  validUntil: string
  status: OfferStatus
  image: string
}

export type AuditLog = {
  id: string
  actor: string
  action: string
  target: string
  createdAt: string
}

const categoryPool = [
  'Mercado',
  'Posto',
  'Farmácia',
  'Barbearia',
  'Salão de beleza',
  'Padaria',
  'Restaurante',
  'Fastfood',
  'Academia',
  'Laboratório',
  'Clínica odontológica',
  'Motorista',
  'Livraria',
  'Petshop',
  'Serviços gerais',
]

const cityPool: Record<Region, string[]> = {
  UNASP: ['Engenheiro Coelho', 'Artur Nogueira', 'Holambra'],
  UNIAENE: ['Cachoeira', 'Sao Felix', 'Muritiba'],
  IAP: ['Ivatuba', 'Maringá', 'Paiçandu'],
}

const statusPool: StudentStatus[] = ['ATIVO', 'ATIVO', 'ATIVO', 'PENDENTE', 'INATIVO', 'BLOQUEADO']

const studentNames = [
  'Ana Luiza Martins',
  'Bruno Henrique Alves',
  'Camila Rodrigues',
  'Diego Santos',
  'Eduarda Pereira',
  'Felipe Costa',
  'Gabriela Nunes',
  'Henrique Souza',
  'Isabela Rocha',
  'Joao Pedro Lima',
  'Karina Duarte',
  'Leonardo Barros',
  'Mariana Oliveira',
  'Nicolas Araujo',
  'Olivia Mendonca',
  'Paulo Vitor Dias',
  'Quezia Menezes',
  'Rafael Teixeira',
  'Sabrina Freitas',
  'Thiago Cardoso',
]

const cpfBase = [
  '11111111111',
  '22222222222',
  '33333333333',
  '44444444444',
  '55555555555',
  '66666666666',
  '77777777777',
  '88888888888',
  '99999999999',
  '12312312312',
  '34534534534',
  '56756756756',
  '78978978978',
  '90909090909',
  '10101010101',
  '12121212121',
  '23232323232',
  '34343434343',
  '45454545454',
  '56565656565',
]

export const initialStudents: StudentRecord[] = studentNames.map((name, idx) => {
  const region = idx % 3 === 0 ? 'UNASP' : idx % 3 === 1 ? 'UNIAENE' : 'IAP'
  const city = cityPool[region][idx % cityPool[region].length]
  const status = statusPool[idx % statusPool.length]

  return {
    id: `stu-${idx + 1}`,
    name,
    cpf: cpfBase[idx],
    email: `aluno${idx + 1}@euplus.com.br`,
    phone: `1199${String(100000 + idx * 97).slice(0, 6)}`,
    city,
    status,
    economyYtd: 1200 + idx * 180,
    projected5y: 16000 + idx * 1200,
    createdAt: `2026-0${(idx % 6) + 1}-${String((idx % 27) + 1).padStart(2, '0')}`,
    password: '123456',
  }
})

const partnerSeed: Array<Omit<PartnerRecord, 'id' | 'logo'>> = [
  {
    name: 'Mercado Smart Coelho',
    cnpj: '10.111.111/0001-11',
    category: 'Mercado',
    phone: '(19) 3012-1100',
    address: 'Av. Principal, 200',
    city: 'Engenheiro Coelho',
    region: 'UNASP',
    lat: -22.485,
    lng: -47.211,
    status: 'ATIVO',
    showOnMap: true,
    showOnOffers: true,
  },
  {
    name: 'Posto Rede Plus',
    cnpj: '10.111.111/0001-12',
    category: 'Posto',
    phone: '(19) 3012-1101',
    address: 'Rod. SP-332, km 157',
    city: 'Artur Nogueira',
    region: 'UNASP',
    lat: -22.576,
    lng: -47.173,
    status: 'ATIVO',
    showOnMap: true,
    showOnOffers: true,
  },
  {
    name: 'Farmácia Vida',
    cnpj: '10.111.111/0001-13',
    category: 'Farmácia',
    phone: '(71) 3012-1102',
    address: 'Rua da Saúde, 44',
    city: 'Cachoeira',
    region: 'UNIAENE',
    lat: -12.616,
    lng: -38.963,
    status: 'ATIVO',
    showOnMap: true,
    showOnOffers: true,
  },
  {
    name: 'Barbearia Corte Fino',
    cnpj: '10.111.111/0001-14',
    category: 'Barbearia',
    phone: '(71) 3012-1103',
    address: 'Alameda Premium, 98',
    city: 'Sao Felix',
    region: 'UNIAENE',
    lat: -12.604,
    lng: -38.973,
    status: 'ATIVO',
    showOnMap: true,
    showOnOffers: true,
  },
  {
    name: 'Laboratório Exata',
    cnpj: '10.111.111/0001-15',
    category: 'Laboratório',
    phone: '(44) 3012-1104',
    address: 'Rua Central, 310',
    city: 'Maringá',
    region: 'IAP',
    lat: -23.425,
    lng: -51.938,
    status: 'ATIVO',
    showOnMap: true,
    showOnOffers: false,
  },
]

while (partnerSeed.length < 15) {
  const idx = partnerSeed.length
  const region: Region = idx % 3 === 0 ? 'UNASP' : idx % 3 === 1 ? 'UNIAENE' : 'IAP'
  const city = cityPool[region][idx % cityPool[region].length]
  partnerSeed.push({
    name: `Parceiro ${idx + 1}`,
    cnpj: `10.111.111/0001-${String(idx + 20).padStart(2, '0')}`,
    category: categoryPool[idx % categoryPool.length],
    phone: `(11) 3012-${String(1105 + idx).padStart(4, '0')}`,
    address: `Rua Operacional, ${120 + idx}`,
    city,
    region,
    lat: -22.8 + idx * 0.08,
    lng: -47.3 + idx * 0.05,
    status: idx % 5 === 0 ? 'INATIVO' : 'ATIVO',
    showOnMap: idx % 6 !== 0,
    showOnOffers: idx % 4 !== 0,
  })
}

export const initialPartners: PartnerRecord[] = partnerSeed.map((partner, idx) => ({
  ...partner,
  id: `prt-${idx + 1}`,
  logo: `https://picsum.photos/seed/euplus-partner-${idx + 1}/320/220`,
}))

export const initialOffers: OfferRecord[] = Array.from({ length: 12 }).map((_, idx) => {
  const partner = initialPartners[idx % initialPartners.length]
  return {
    id: `ofr-${idx + 1}`,
    partnerId: partner.id,
    title: `${partner.category} com desconto especial`,
    description: `${partner.name}: economia imediata para alunos ativos da rede Euplus.`,
    discount: 8 + (idx % 6) * 2,
    validUntil: `2026-${String((idx % 6) + 7).padStart(2, '0')}-30`,
    status: idx % 7 === 0 ? 'PAUSADA' : 'ATIVA',
    image: `https://picsum.photos/seed/euplus-offer-${idx + 1}/640/420`,
  }
})

export const adminUsers: AdminUser[] = [
  {
    id: 'adm-1',
    name: 'Lucas Renck',
    email: 'admin@euplus.com.br',
    role: 'owner',
    password: 'admin123',
  },
  {
    id: 'adm-2',
    name: 'Equipe Operacional',
    email: 'operador@euplus.com.br',
    role: 'operador',
    password: 'admin123',
  },
]

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'log-1',
    actor: 'Lucas Renck',
    action: 'Atualizou status',
    target: 'Aluno stu-3 para ATIVO',
    createdAt: '2026-04-10 09:12',
  },
  {
    id: 'log-2',
    actor: 'Equipe Operacional',
    action: 'Criou parceiro',
    target: 'Parceiro Mercado Smart Coelho',
    createdAt: '2026-04-10 10:04',
  },
  {
    id: 'log-3',
    actor: 'Lucas Renck',
    action: 'Criou oferta',
    target: 'Oferta ofr-4',
    createdAt: '2026-04-10 11:35',
  },
]
