import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import {
  LayoutDashboard,
  LogOut,
  Search,
  Shield,
  Store,
  Tags,
  UserCircle2,
  Users,
} from 'lucide-react'
import {
  type AuditLog,
  type OfferRecord,
  type OfferStatus,
  type PartnerRecord,
  type PartnerStatus,
  type Region,
  type StudentRecord,
  type StudentStatus,
} from './dashboardData'

type Session =
  | { role: 'admin'; adminId: string; adminName: string; adminEmail: string; token: string }
  | null

type GrowthWindow = 1 | 5 | 12
type UserAccountStatus = StudentStatus

type DependentRecord = {
  id: string
  name: string
  cpf: string
}

type UserAccountRecord = {
  id: string
  fullName: string
  cpf: string
  email: string
  phone: string
  cep: string
  city: string
  studentCode: string
  status: UserAccountStatus
  dependents: DependentRecord[]
  createdAt: string
}

type GrowthPoint = { label: string; total: number }

const dashboardBg =
  'bg-[radial-gradient(circle_at_top_right,rgba(36,76,255,.22),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(20,194,126,.12),transparent_45%),#0b111a]'

const statusStyles: Record<StudentStatus, string> = {
  ATIVO: 'bg-emerald-400/15 text-emerald-300 border-emerald-300/30',
  INATIVO: 'bg-slate-500/15 text-slate-300 border-slate-400/30',
  PENDENTE: 'bg-amber-400/15 text-amber-300 border-amber-300/30',
  BLOQUEADO: 'bg-rose-400/15 text-rose-300 border-rose-300/30',
}

const partnerStatusStyles: Record<PartnerStatus, string> = {
  ATIVO: 'bg-emerald-400/15 text-emerald-300 border-emerald-300/30',
  INATIVO: 'bg-slate-500/15 text-slate-300 border-slate-400/30',
}

const offerStatusStyles: Record<OfferStatus, string> = {
  ATIVA: 'bg-emerald-400/15 text-emerald-300 border-emerald-300/30',
  PAUSADA: 'bg-amber-400/15 text-amber-300 border-amber-300/30',
  ENCERRADA: 'bg-slate-500/15 text-slate-300 border-slate-400/30',
}

const formatCpf = (value: string) =>
  value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')

const onlyDigits = (value: string) => value.replace(/\D/g, '')
const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

const formatRegionLabel = (region: string) => (region === 'IAP' ? 'FAP' : region)

const getHashPath = () => {
  if (typeof window === 'undefined') return '/login-admin'
  const clean = window.location.hash.replace(/^#/, '')
  return clean.startsWith('/') ? clean : '/login-admin'
}

const navigateHash = (path: string) => {
  window.location.hash = path
}

const functionsBase = import.meta.env.DEV
  ? 'http://localhost:8888/.netlify/functions'
  : '/.netlify/functions'
const MAX_DEPENDENTS = 3

const readApiBody = async (response: Response, htmlFallbackMessage: string) => {
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) return response.json()

  const text = await response.text()
  const preview = text.trim().slice(0, 120).toLowerCase()
  if (preview.startsWith('<!doctype') || preview.startsWith('<html')) {
    throw new Error(htmlFallbackMessage)
  }
  throw new Error('Resposta inválida do servidor.')
}

function StatusBadge({ status }: { status: StudentStatus | PartnerStatus | OfferStatus }) {
  const style =
    status in statusStyles
      ? statusStyles[status as StudentStatus]
      : status in partnerStatusStyles
        ? partnerStatusStyles[status as PartnerStatus]
        : offerStatusStyles[status as OfferStatus]

  return <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${style}`}>{status}</span>
}

function GrowthChartCard({
  title,
  subtitle,
  series,
  growthWindow,
}: {
  title: string
  subtitle: string
  series: GrowthPoint[]
  growthWindow: GrowthWindow
}) {
  const growthMax = Math.max(...series.map((point) => point.total), 1)

  return (
    <section className="rounded-2xl border border-indigo-300/20 bg-[#111632]/70 p-4">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="text-xs text-slate-300">{subtitle}</p>
      <div className="mt-3 rounded-xl border border-indigo-300/20 bg-[#0f1330] p-3">
        <div className="flex items-end gap-2 overflow-x-auto">
          {series.map((point) => (
            <div key={`${title}-${point.label}`} className={`${growthWindow === 1 ? 'min-w-[20px]' : 'min-w-[44px]'} text-center`}>
              <p className="mb-1 text-[10px] text-slate-400">{point.total}</p>
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-indigo-500 to-cyan-300"
                style={{ height: `${Math.max((point.total / growthMax) * 140, 18)}px` }}
              />
              <p className="mt-1 text-[10px] text-slate-400">{point.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Shell({
  title,
  subtitle,
  children,
  nav,
  onLogout,
  mobileItems,
  currentPath,
  onNavigate,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
  nav: { label: string; path: string; icon: React.ReactNode }[]
  onLogout: () => void
  mobileItems: { label: string; path: string; icon: React.ReactNode }[]
  currentPath: string
  onNavigate: (path: string) => void
}) {
  return (
    <div translate="no" className={`notranslate min-h-screen text-slate-100 ${dashboardBg}`}>
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-72 border-r border-indigo-400/20 bg-[#140f1f]/80 p-6 backdrop-blur-xl lg:block">
          <div className="mb-8 border-b border-white/10 pb-6">
            <img
              src="https://image2url.com/r2/default/images/1775681435269-bef1d9c7-a142-4b0a-9221-060f7ee7998c.png"
              alt="Euplus"
              className="h-14 w-auto"
            />
            <p className="mt-3 text-xs text-slate-400">Cockpit administrativo da operação Euplus.</p>
          </div>

          <nav className="space-y-1.5">
            {nav.map((item) => (
              <button
                key={item.path}
                onClick={() => onNavigate(item.path)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition ${
                  currentPath === item.path || currentPath.startsWith(`${item.path}/`)
                    ? 'bg-indigo-500/20 text-indigo-300'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
                type="button"
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          <button
            type="button"
            onClick={onLogout}
            className="mt-8 inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-xs text-slate-300 transition hover:border-rose-300/40 hover:text-rose-200"
          >
            <LogOut className="h-4 w-4" />
            Encerrar sessão
          </button>
        </aside>

        <main className="flex min-h-screen w-full flex-col">
          <header className="sticky top-0 z-20 hidden border-b border-indigo-400/20 bg-[#0e0b17]/90 px-4 py-3 backdrop-blur-xl sm:px-6 lg:block">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="font-headline text-xl font-bold text-white sm:text-2xl">{title}</h1>
                <p className="text-xs text-slate-400 sm:text-sm">{subtitle}</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-300/30 bg-indigo-500/10 px-3 py-1 text-[11px] font-medium text-indigo-200">
                  <Shield className="h-3.5 w-3.5" />
                  Modo administrativo
                </div>
                <a
                  href="#"
                  className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:text-white"
                >
                  Voltar ao site
                </a>
              </div>
            </div>
          </header>

          <motion.div
            key={currentPath}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            className="flex-1 px-4 py-6 pb-24 sm:px-6"
          >
            {children}
          </motion.div>

          <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-indigo-400/20 bg-[#0e0b17]/95 px-2 py-2 backdrop-blur-xl lg:hidden">
            <div className="mx-auto flex max-w-2xl items-center justify-between">
              {mobileItems.map((item) => {
                const active = currentPath === item.path || currentPath.startsWith(`${item.path}/`)
                return (
                  <button
                    type="button"
                    key={item.path}
                    onClick={() => onNavigate(item.path)}
                    className={`flex min-w-[68px] flex-col items-center gap-1 rounded-lg px-2 py-1 text-[11px] ${
                      active ? 'text-indigo-300' : 'text-slate-400'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                )
              })}
              <button
                type="button"
                onClick={onLogout}
                className="flex min-w-[68px] flex-col items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-rose-300"
              >
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </button>
            </div>
          </nav>
        </main>
      </div>
    </div>
  )
}

function LoginCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div translate="no" className={`notranslate min-h-screen ${dashboardBg} flex items-center justify-center px-4 py-10`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#111a28]/80 p-6 shadow-[0_20px_60px_rgba(0,0,0,.35)] backdrop-blur-xl sm:p-8"
      >
        <img
          src="https://image2url.com/r2/default/images/1775681435269-bef1d9c7-a142-4b0a-9221-060f7ee7998c.png"
          alt="Euplus"
          className="h-12 w-auto"
        />
        <h1 className="mt-6 font-headline text-3xl font-bold text-white">{title}</h1>
        <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
        <div className="mt-8 space-y-4">{children}</div>
      </motion.div>
    </div>
  )
}

function KpiRow({
  items,
  mobileTwoCols = false,
}: {
  items: { label: string; value: string; hint?: string }[]
  mobileTwoCols?: boolean
}) {
  return (
    <div className={`grid gap-3 md:grid-cols-2 xl:grid-cols-4 ${mobileTwoCols ? 'grid-cols-2' : 'grid-cols-1'}`}>
      {items.map((item) => (
        <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-slate-400">{item.label}</p>
          <p className="mt-1 text-2xl font-semibold text-white">{item.value}</p>
          {item.hint ? <p className="mt-1 text-xs text-slate-400">{item.hint}</p> : null}
        </div>
      ))}
    </div>
  )
}

function DashboardApp() {
  const [currentPath, setCurrentPath] = useState(getHashPath)
  const [session, setSession] = useState<Session>(null)

  const [students, setStudents] = useState<StudentRecord[]>([])
  const [userAccounts, setUserAccounts] = useState<UserAccountRecord[]>([])
  const [partners, setPartners] = useState<PartnerRecord[]>([])
  const [offers, setOffers] = useState<OfferRecord[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])

  const [adminLogin, setAdminLogin] = useState({ email: '', password: '', otp: '' })
  const [statusLookupCpf, setStatusLookupCpf] = useState('')
  const [statusResult, setStatusResult] = useState<StudentStatus | null>(null)
  const [statusError, setStatusError] = useState('')
  const [authError, setAuthError] = useState('')

  const [studentSearch, setStudentSearch] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [partnerSearch, setPartnerSearch] = useState('')
  const [offerSearch, setOfferSearch] = useState('')
  const [growthWindow, setGrowthWindow] = useState<GrowthWindow>(5)
  const [showNewStudentForm, setShowNewStudentForm] = useState(false)
  const [newStudentDraft, setNewStudentDraft] = useState({
    name: '',
    cpf: '',
    email: '',
    phone: '',
    city: '',
    status: 'ATIVO' as StudentStatus,
  })
  const [showNewUserForm, setShowNewUserForm] = useState(false)
  const [newUserDraft, setNewUserDraft] = useState({
    fullName: '',
    cpf: '',
    email: '',
    phone: '',
    cep: '',
    city: '',
    studentCode: '',
    status: 'ATIVO' as UserAccountStatus,
    dependents: [] as DependentRecord[],
  })

  // Único ponto de saída pro /dashboard: sempre manda o token e trata 401 num lugar só.
  // O token pode vir explícito porque no login o `session` ainda não foi setado.
  const dashboardFetch = async (init: RequestInit = {}, explicitToken?: string) => {
    const token = explicitToken ?? (session?.role === 'admin' ? session.token : '')
    const response = await fetch(`${functionsBase}/dashboard`, {
      ...init,
      headers: {
        ...(init.headers ?? {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
    if (response.status === 401) {
      setSession(null)
      navigate('/login-admin')
      throw new Error('Sessão expirada. Faça login novamente.')
    }
    return response
  }

  const loadDashboardData = async (explicitToken?: string) => {
    const response = await dashboardFetch({}, explicitToken)
    const data = await readApiBody(response, 'A função de dashboard não foi encontrada no deploy.')
    if (!response.ok || !data.ok) throw new Error(data.error || 'Falha ao carregar dados do dashboard.')
    setStudents(data.students || [])
    setUserAccounts(data.vidas || [])
    setPartners(data.partners || [])
    setOffers(data.offers || [])
    setAuditLogs(data.auditLogs || [])
  }

  useEffect(() => {
    const onHash = () => setCurrentPath(getHashPath())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    loadDashboardData().catch((error) => {
      console.error(error)
      setAuthError(error instanceof Error ? error.message : 'Falha ao carregar dados do dashboard.')
    })
  }, [])

  useEffect(() => {
    if (session?.role !== 'admin') return

    const refresh = () => {
      loadDashboardData().catch((error) => {
        console.error(error)
      })
    }

    const intervalId = window.setInterval(refresh, 15000)
    const onFocus = () => refresh()
    window.addEventListener('focus', onFocus)

    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener('focus', onFocus)
    }
  }, [session])

  useEffect(() => {
    if (currentPath.startsWith('/admin') && session?.role !== 'admin') {
      navigateHash('/login-admin')
    }
  }, [currentPath, session])

  const currentAdmin = session?.role === 'admin' ? { id: session.adminId, name: session.adminName } : null

  const studentFiltered = useMemo(() => {
    const query = normalizeText(studentSearch.trim())
    const digitQuery = onlyDigits(studentSearch)
    if (!query) return students
    return students.filter(
      (student) =>
        normalizeText(student.name).includes(query) ||
        normalizeText(student.email).includes(query) ||
        (digitQuery ? student.cpf.includes(digitQuery) : false),
    )
  }, [studentSearch, students])

  const userFiltered = useMemo(() => {
    const query = normalizeText(userSearch.trim())
    const digitQuery = onlyDigits(userSearch)
    if (!query) return userAccounts
    return userAccounts.filter(
      (user) =>
        normalizeText(user.fullName).includes(query) ||
        normalizeText(user.email).includes(query) ||
        (digitQuery ? user.cpf.includes(digitQuery) : false),
    )
  }, [userAccounts, userSearch])

  const partnerFiltered = useMemo(() => {
    const query = normalizeText(partnerSearch.trim())
    if (!query) return partners
    return partners.filter(
      (partner) =>
        normalizeText(partner.name).includes(query) ||
        normalizeText(partner.category).includes(query) ||
        normalizeText(partner.city).includes(query),
    )
  }, [partnerSearch, partners])

  const offerFiltered = useMemo(() => {
    const query = normalizeText(offerSearch.trim())
    if (!query) return offers
    return offers.filter((offer) => {
      const partner = partners.find((item) => item.id === offer.partnerId)
      return (
        normalizeText(offer.title).includes(query) ||
        normalizeText(offer.description).includes(query) ||
        normalizeText(partner?.name ?? '').includes(query)
      )
    })
  }, [offerSearch, offers, partners])

  const buildGrowthSeries = (createdAtValues: string[]): GrowthPoint[] => {
    const createdDates = createdAtValues
      .map((value) => {
        const date = new Date(value)
        return Number.isNaN(date.getTime()) ? null : date
      })
      .filter((date): date is Date => date !== null)

    if (growthWindow === 1) {
      const now = new Date()
      return Array.from({ length: 30 }).map((_, index) => {
        const date = new Date(now)
        date.setDate(now.getDate() - (29 - index))
        date.setHours(23, 59, 59, 999)
        const label = String(date.getDate()).padStart(2, '0')
        const total = createdDates.filter((createdAt) => createdAt <= date).length
        return { label, total }
      })
    }

    return Array.from({ length: growthWindow }).map((_, index) => {
      const date = new Date()
      date.setMonth(date.getMonth() - (growthWindow - 1 - index))
      const monthLabel = date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59)
      const total = createdDates.filter((createdAt) => createdAt <= monthEnd).length
      return { label: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1), total }
    })
  }

  const studentGrowthSeries = useMemo(
    () => buildGrowthSeries(students.map((student) => student.createdAt)),
    [growthWindow, students],
  )
  const vidaGrowthSeries = useMemo(
    () => buildGrowthSeries(userAccounts.map((user) => user.createdAt)),
    [growthWindow, userAccounts],
  )
  const partnerGrowthSeries = useMemo(
    () => buildGrowthSeries(partners.map((partner) => partner.createdAt || '')),
    [growthWindow, partners],
  )

  const navigate = (path: string) => navigateHash(path)

  const logout = () => {
    setSession(null)
    setAuthError('')
    navigateHash('/login-admin')
  }

  const openStudentFromSearch = () => {
    const term = studentSearch.trim()
    if (!term) return

    const digits = onlyDigits(term)
    const normalized = normalizeText(term)
    const matched = students.find((student) => {
      if (digits && digits.length === 11 && student.cpf === digits) return true
      return normalizeText(student.email) === normalized
    })

    if (matched) {
      setAuthError('')
      navigate(`/admin/alunos/${matched.id}`)
      return
    }
    setAuthError('Nenhum aluno encontrado para o CPF ou e-mail informado.')
  }

  const handleAdminLogin = async () => {
    try {
      const response = await fetch(`${functionsBase}/dashboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'adminLogin',
          email: adminLogin.email,
          password: adminLogin.password,
        }),
      })
      const data = await readApiBody(response, 'Falha no login administrativo.')
      if (!response.ok || !data.ok) {
        setAuthError(data.error || 'Credenciais administrativas inválidas.')
        return
      }

      // O token tem que ir explícito aqui: o setSession abaixo ainda não refletiu.
      await loadDashboardData(data.token)
      setSession({
        role: 'admin',
        adminId: `adm-${data.admin.id}`,
        adminName: data.admin.name,
        adminEmail: data.admin.email,
        token: data.token,
      })
      setAuthError('')
      navigate('/admin/dashboard')
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Falha no login administrativo.')
    }
  }

  const handleStatusLookup = async () => {
    const cpf = onlyDigits(statusLookupCpf)
    if (cpf.length !== 11) {
      setStatusError('Informe um CPF com 11 dígitos.')
      setStatusResult(null)
      return
    }
    try {
      const response = await fetch(`${functionsBase}/status?cpf=${cpf}`)
      const data = await readApiBody(response, 'A função de status não foi encontrada no deploy.')
      if (!response.ok || !data.ok) {
        setStatusError(data.error || 'Cadastro não localizado para este CPF.')
        setStatusResult(null)
        return
      }
      setStatusResult(data.registration?.status || 'PENDENTE')
      setStatusError('')
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : 'Erro ao consultar status.')
      setStatusResult(null)
    }
  }

  const updateStudentStatus = async (studentId: string, status: StudentStatus) => {
    try {
      const response = await dashboardFetch({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateStudentStatus',
          id: studentId,
          status,
        }),
      })
      const data = await readApiBody(response, 'Falha ao atualizar status de aluno.')
      if (!response.ok || !data.ok) throw new Error(data.error || 'Falha ao atualizar status de aluno.')
      await loadDashboardData()
      setAuthError('')
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Falha ao atualizar status de aluno.')
    }
  }

  const updateUserStatus = async (userId: string, status: UserAccountStatus) => {
    try {
      const response = await dashboardFetch({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateVidaStatus',
          id: userId,
          status,
        }),
      })
      const data = await readApiBody(response, 'Falha ao atualizar status de usuário.')
      if (!response.ok || !data.ok) throw new Error(data.error || 'Falha ao atualizar status de usuário.')
      await loadDashboardData()
      setAuthError('')
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Falha ao atualizar status de usuário.')
    }
  }

  const handleAdminCreateStudent = async () => {
    const cpf = onlyDigits(newStudentDraft.cpf)
    if (!newStudentDraft.name || cpf.length !== 11 || !newStudentDraft.email || !newStudentDraft.phone) {
      setAuthError('Para criar aluno, informe nome, CPF válido, e-mail e telefone.')
      return
    }
    try {
      const response = await fetch(`${functionsBase}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: newStudentDraft.name,
          cpf,
          email: newStudentDraft.email,
          phone: newStudentDraft.phone,
          city: newStudentDraft.city,
        }),
      })
      const data = await readApiBody(response, 'Falha ao salvar aluno.')
      if (!response.ok || !data.ok) throw new Error(data.error || 'Falha ao salvar aluno.')

      await updateStudentStatus(`stu-${data.registration.id}`, newStudentDraft.status)
      setShowNewStudentForm(false)
      setNewStudentDraft({ name: '', cpf: '', email: '', phone: '', city: '', status: 'ATIVO' })
      setAuthError('')
      await loadDashboardData()
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Falha ao salvar aluno.')
    }
  }

  const addDependentToDraft = () => {
    if (newUserDraft.dependents.length >= MAX_DEPENDENTS) return
    setNewUserDraft((prev) => ({
      ...prev,
      dependents: [...prev.dependents, { id: `tmp-${Date.now()}-${prev.dependents.length}`, name: '', cpf: '' }],
    }))
  }

  const updateDraftDependent = (depId: string, patch: Partial<DependentRecord>) => {
    setNewUserDraft((prev) => ({
      ...prev,
      dependents: prev.dependents.map((dep) => (dep.id === depId ? { ...dep, ...patch } : dep)),
    }))
  }

  const removeDraftDependent = (depId: string) => {
    setNewUserDraft((prev) => ({
      ...prev,
      dependents: prev.dependents.filter((dep) => dep.id !== depId),
    }))
  }

  const handleAdminCreateUser = async () => {
    const cpf = onlyDigits(newUserDraft.cpf)
    if (!newUserDraft.fullName || cpf.length !== 11 || !newUserDraft.email) {
      setAuthError('Para criar usuário Vida, informe nome, CPF válido e e-mail.')
      return
    }

    const cleanDependents = newUserDraft.dependents
      .filter((dep) => dep.name.trim().length > 0)
      .map((dep, index) => ({
        id: `dep-${Date.now()}-${index}`,
        name: dep.name.trim(),
        cpf: onlyDigits(dep.cpf),
      }))

    try {
      const response = await dashboardFetch({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createVida',
          fullName: newUserDraft.fullName.trim(),
          cpf,
          email: newUserDraft.email.trim().toLowerCase(),
          phone: newUserDraft.phone.trim(),
          cep: newUserDraft.cep.trim(),
          city: newUserDraft.city.trim(),
          studentCode: newUserDraft.studentCode.trim(),
          status: newUserDraft.status,
          dependents: cleanDependents,
        }),
      })
      const data = await readApiBody(response, 'Falha ao salvar usuário Vida.')
      if (!response.ok || !data.ok) throw new Error(data.error || 'Falha ao salvar usuário Vida.')

      setShowNewUserForm(false)
      setNewUserDraft({
        fullName: '',
        cpf: '',
        email: '',
        phone: '',
        cep: '',
        city: '',
        studentCode: '',
        status: 'ATIVO',
        dependents: [],
      })
      setAuthError('')
      await loadDashboardData()
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Falha ao salvar usuário Vida.')
    }
  }

  const adminNav = [
    { label: 'Visão Geral', path: '/admin/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: 'Alunos', path: '/admin/alunos', icon: <Users className="h-4 w-4" /> },
    { label: 'Vida', path: '/admin/vida', icon: <UserCircle2 className="h-4 w-4" /> },
    { label: 'Parceiros', path: '/admin/parceiros', icon: <Store className="h-4 w-4" /> },
    { label: 'Ofertas', path: '/admin/ofertas', icon: <Tags className="h-4 w-4" /> },
    { label: 'Auditoria', path: '/admin/auditoria', icon: <Shield className="h-4 w-4" /> },
  ]

  const adminKpis = {
    totalStudents: students.length,
    activeStudents: students.filter((item) => item.status === 'ATIVO').length,
    pendingStudents: students.filter((item) => item.status === 'PENDENTE').length,
    activePartners: partners.filter((item) => item.status === 'ATIVO').length,
    activeOffers: offers.filter((item) => item.status === 'ATIVA').length,
  }

  const selectedStudentId = currentPath.startsWith('/admin/alunos/') ? currentPath.split('/').at(-1) ?? '' : null
  const selectedStudent = selectedStudentId ? students.find((student) => student.id === selectedStudentId) : null

  const selectedPartnerId = currentPath.startsWith('/admin/parceiros/') ? currentPath.split('/').at(-1) ?? '' : null
  const selectedPartner = selectedPartnerId ? partners.find((partner) => partner.id === selectedPartnerId) : null

  const selectedOfferId = currentPath.startsWith('/admin/ofertas/') ? currentPath.split('/').at(-1) ?? '' : null
  const selectedOffer = selectedOfferId ? offers.find((offer) => offer.id === selectedOfferId) : null

  useEffect(() => {
    if (selectedStudentId && !selectedStudent) {
      setAuthError('Aluno não encontrado. A lista foi recarregada.')
      navigateHash('/admin/alunos')
    }
  }, [selectedStudentId, selectedStudent])

  if (currentPath === '/consulta-status-cpf') {
    return (
      <LoginCard
        title="Consulta de status por CPF"
        subtitle="A consulta pública retorna apenas o status do cadastro sem expor dados sensíveis."
      >
        <label className="text-xs uppercase tracking-wide text-slate-400">CPF</label>
        <input
          value={statusLookupCpf}
          onChange={(event) => setStatusLookupCpf(formatCpf(event.target.value))}
          className="w-full rounded-xl border border-white/15 bg-slate-900/70 px-4 py-3"
          placeholder="000.000.000-00"
        />
        <button
          type="button"
          onClick={handleStatusLookup}
          className="w-full rounded-xl bg-primary px-4 py-3 font-semibold text-on-primary transition hover:brightness-110"
        >
          Verificar status
        </button>
        {statusError ? <p className="text-sm text-rose-300">{statusError}</p> : null}
        {statusResult ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <p className="text-xs uppercase tracking-wide text-slate-400">Resultado</p>
            <div className="mt-2 inline-flex">
              <StatusBadge status={statusResult} />
            </div>
          </div>
        ) : null}
        <button type="button" onClick={() => navigate('/login-admin')} className="text-sm text-primary">
          Ir para login administrativo
        </button>
      </LoginCard>
    )
  }

  if (currentPath === '/login-admin') {
    return (
      <LoginCard
        title="Login administrativo"
        subtitle="Acesso master interno Euplus para dados de pessoas físicas, estudantes e parceiros."
      >
        <input
          value={adminLogin.email}
          onChange={(event) => setAdminLogin((prev) => ({ ...prev, email: event.target.value }))}
          className="w-full rounded-xl border border-white/15 bg-slate-900/70 px-4 py-3"
          placeholder="E-mail administrativo"
        />
        <input
          type="password"
          value={adminLogin.password}
          onChange={(event) => setAdminLogin((prev) => ({ ...prev, password: event.target.value }))}
          className="w-full rounded-xl border border-white/15 bg-slate-900/70 px-4 py-3"
          placeholder="Senha"
        />
        <input
          value={adminLogin.otp}
          onChange={(event) => setAdminLogin((prev) => ({ ...prev, otp: event.target.value }))}
          className="w-full rounded-xl border border-white/15 bg-slate-900/70 px-4 py-3"
          placeholder="Código 2FA (opcional)"
        />
        <button type="button" onClick={handleAdminLogin} className="w-full rounded-xl bg-primary px-4 py-3 font-semibold text-on-primary">
          Entrar como admin
        </button>
        <button type="button" onClick={() => navigate('/consulta-status-cpf')} className="text-sm text-slate-300">
          Consulta pública de status por CPF
        </button>
        {authError ? <p className="text-sm text-rose-300">{authError}</p> : null}
      </LoginCard>
    )
  }

  if (session?.role !== 'admin') {
    navigate('/login-admin')
    return null
  }

  let adminContent: React.ReactNode = null

  if (currentPath === '/admin/dashboard') {
    adminContent = (
      <div className="space-y-5">
        <KpiRow
          mobileTwoCols
          items={[
            { label: 'Total de alunos', value: String(adminKpis.totalStudents) },
            { label: 'Alunos ativos', value: String(adminKpis.activeStudents) },
            { label: 'Cadastros pendentes', value: String(adminKpis.pendingStudents) },
            { label: 'Parceiros ativos', value: String(adminKpis.activePartners), hint: `${adminKpis.activeOffers} ofertas ativas` },
          ]}
        />

        <section className="rounded-2xl border border-indigo-300/20 bg-[#111632]/70 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white">Crescimento de cadastros</h3>
              <p className="text-sm text-slate-300">
                {growthWindow === 1
                  ? 'Visão diária dos últimos 30 dias para alunos, vidas e empresas.'
                  : 'Visão mensal acumulada para alunos, vidas e empresas.'}
              </p>
            </div>
            <div className="inline-flex rounded-xl border border-white/15 bg-[#121a2f] p-1 text-xs">
              {[1, 5, 12].map((windowOption) => (
                <button
                  key={windowOption}
                  type="button"
                  onClick={() => setGrowthWindow(windowOption as GrowthWindow)}
                  className={`rounded-lg px-3 py-1.5 font-semibold ${
                    growthWindow === windowOption ? 'bg-indigo-400/30 text-white' : 'text-slate-300'
                  }`}
                >
                  {windowOption === 1 ? '30 dias' : `${windowOption}m`}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="grid gap-4 xl:grid-cols-3">
          <GrowthChartCard
            title="Crescimento de alunos"
            subtitle={growthWindow === 1 ? 'Total acumulado por dia.' : 'Total acumulado por mês.'}
            series={studentGrowthSeries}
            growthWindow={growthWindow}
          />
          <GrowthChartCard
            title="Crescimento de vidas"
            subtitle={growthWindow === 1 ? 'Cadastros Vida por dia.' : 'Cadastros Vida por mês.'}
            series={vidaGrowthSeries}
            growthWindow={growthWindow}
          />
          <GrowthChartCard
            title="Crescimento de empresas"
            subtitle={growthWindow === 1 ? 'Parceiros por dia.' : 'Parceiros por mês.'}
            series={partnerGrowthSeries}
            growthWindow={growthWindow}
          />
        </div>

        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <h3 className="text-lg font-semibold text-white">Operação em tempo real</h3>
          <p className="text-xs text-slate-400">Acompanhamento dos últimos cadastros e status.</p>
          <div className="mt-3 hidden overflow-hidden rounded-xl border border-white/10 md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.04] text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-3 py-2">Aluno</th>
                  <th className="px-3 py-2">Cidade</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Ação</th>
                </tr>
              </thead>
              <tbody>
                {students.slice(0, 8).map((student) => (
                  <tr key={student.id} className="border-t border-white/10">
                    <td className="px-3 py-2">{student.name}</td>
                    <td className="px-3 py-2 text-slate-300">{student.city}</td>
                    <td className="px-3 py-2"><StatusBadge status={student.status} /></td>
                    <td className="px-3 py-2">
                      <button className="text-xs text-primary" onClick={() => navigate(`/admin/alunos/${student.id}`)}>
                        Detalhar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    )
  }

  if (currentPath === '/admin/alunos') {
    adminContent = (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              value={studentSearch}
              onChange={(event) => setStudentSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  openStudentFromSearch()
                }
              }}
              placeholder="Buscar por nome, CPF ou e-mail"
              className="w-full rounded-xl border border-white/15 bg-slate-900/70 py-2 pl-9 pr-3 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={openStudentFromSearch}
            className="rounded-xl border border-white/15 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-primary/50 hover:text-white"
          >
            Abrir cadastro
          </button>
          <button className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-on-primary" onClick={() => setShowNewStudentForm((prev) => !prev)}>
            {showNewStudentForm ? 'Cancelar' : 'Adicionar aluno'}
          </button>
        </div>

        {showNewStudentForm ? (
          <div className="grid gap-2 rounded-2xl border border-white/10 bg-white/[0.02] p-4 md:grid-cols-2">
            <input className="rounded-xl border border-white/15 bg-slate-900/70 px-3 py-2" placeholder="Nome completo" value={newStudentDraft.name} onChange={(e) => setNewStudentDraft((prev) => ({ ...prev, name: e.target.value }))} />
            <input className="rounded-xl border border-white/15 bg-slate-900/70 px-3 py-2" placeholder="CPF" value={newStudentDraft.cpf} onChange={(e) => setNewStudentDraft((prev) => ({ ...prev, cpf: formatCpf(e.target.value) }))} />
            <input className="rounded-xl border border-white/15 bg-slate-900/70 px-3 py-2" placeholder="E-mail" value={newStudentDraft.email} onChange={(e) => setNewStudentDraft((prev) => ({ ...prev, email: e.target.value }))} />
            <input className="rounded-xl border border-white/15 bg-slate-900/70 px-3 py-2" placeholder="Telefone" value={newStudentDraft.phone} onChange={(e) => setNewStudentDraft((prev) => ({ ...prev, phone: e.target.value }))} />
            <input className="rounded-xl border border-white/15 bg-slate-900/70 px-3 py-2" placeholder="Cidade" value={newStudentDraft.city} onChange={(e) => setNewStudentDraft((prev) => ({ ...prev, city: e.target.value }))} />
            <select className="rounded-xl border border-white/15 bg-slate-900/70 px-3 py-2" value={newStudentDraft.status} onChange={(e) => setNewStudentDraft((prev) => ({ ...prev, status: e.target.value as StudentStatus }))}>
              <option value="ATIVO">ATIVO</option>
              <option value="INATIVO">INATIVO</option>
              <option value="PENDENTE">PENDENTE</option>
              <option value="BLOQUEADO">BLOQUEADO</option>
            </select>
            <button className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-on-primary md:col-span-2" onClick={handleAdminCreateStudent}>
              Salvar aluno
            </button>
          </div>
        ) : null}

        <div className="hidden overflow-hidden rounded-2xl border border-white/10 md:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.04] text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-3 py-2">Aluno</th>
                <th className="px-3 py-2">CPF</th>
                <th className="px-3 py-2">Cidade</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Alterar</th>
                <th className="px-3 py-2">Ação</th>
              </tr>
            </thead>
            <tbody>
              {studentFiltered.length ? (
                studentFiltered.map((student) => (
                  <tr key={student.id} className="border-t border-white/10">
                    <td className="px-3 py-2">{student.name}</td>
                    <td className="px-3 py-2 text-slate-300">{formatCpf(student.cpf)}</td>
                    <td className="px-3 py-2 text-slate-300">{student.city}</td>
                    <td className="px-3 py-2"><StatusBadge status={student.status} /></td>
                    <td className="px-3 py-2">
                      <select className="rounded-lg border border-white/15 bg-slate-900/70 px-2 py-1 text-xs" value={student.status} onChange={(e) => updateStudentStatus(student.id, e.target.value as StudentStatus)}>
                        <option value="ATIVO">ATIVO</option>
                        <option value="INATIVO">INATIVO</option>
                        <option value="PENDENTE">PENDENTE</option>
                        <option value="BLOQUEADO">BLOQUEADO</option>
                      </select>
                    </td>
                    <td className="px-3 py-2"><button className="text-primary" onClick={() => navigate(`/admin/alunos/${student.id}`)}>Detalhar</button></td>
                  </tr>
                ))
              ) : (
                <tr className="border-t border-white/10">
                  <td colSpan={6} className="px-3 py-6 text-center text-sm text-slate-400">
                    Nenhum aluno encontrado para o filtro atual.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="space-y-2 md:hidden">
          {studentFiltered.length ? (
            studentFiltered.map((student) => (
              <article key={student.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-white">{student.name}</p>
                  <StatusBadge status={student.status} />
                </div>
                <p className="mt-1 text-xs text-slate-300">{formatCpf(student.cpf)}</p>
                <p className="text-xs text-slate-400">{student.city || 'Cidade não informada'}</p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <select className="w-full rounded-lg border border-white/15 bg-slate-900/70 px-2 py-1 text-xs" value={student.status} onChange={(e) => updateStudentStatus(student.id, e.target.value as StudentStatus)}>
                    <option value="ATIVO">ATIVO</option>
                    <option value="INATIVO">INATIVO</option>
                    <option value="PENDENTE">PENDENTE</option>
                    <option value="BLOQUEADO">BLOQUEADO</option>
                  </select>
                  <button className="shrink-0 text-sm text-primary" onClick={() => navigate(`/admin/alunos/${student.id}`)}>
                    Detalhar
                  </button>
                </div>
              </article>
            ))
          ) : (
            <p className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-4 text-center text-sm text-slate-400">
              Nenhum aluno encontrado para o filtro atual.
            </p>
          )}
        </div>
      </div>
    )
  }

  if (selectedStudent) {
    adminContent = (
      <div className="space-y-4">
        <button className="text-sm text-primary" onClick={() => navigate('/admin/alunos')}>← Voltar para alunos</button>
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <h3 className="text-lg font-semibold text-white">Dados do aluno</h3>
            <div className="mt-3 space-y-2 text-sm text-slate-300">
              <p><span className="text-slate-400">Nome:</span> {selectedStudent.name}</p>
              <p><span className="text-slate-400">CPF:</span> {formatCpf(selectedStudent.cpf)}</p>
              <p><span className="text-slate-400">E-mail:</span> {selectedStudent.email}</p>
              <p><span className="text-slate-400">Telefone:</span> {selectedStudent.phone || '-'}</p>
              <p><span className="text-slate-400">Cidade:</span> {selectedStudent.city || '-'}</p>
            </div>
          </section>
          <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Alterar status</p>
            <div className="mt-3 space-y-2">
              {(['ATIVO', 'INATIVO', 'PENDENTE', 'BLOQUEADO'] as StudentStatus[]).map((status) => (
                <button type="button" key={status} className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition ${selectedStudent.status === status ? 'border-primary/50 bg-primary/15 text-primary' : 'border-white/15 hover:border-white/30'}`} onClick={() => updateStudentStatus(selectedStudent.id, status)}>
                  {status}
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    )
  }

  if (currentPath === '/admin/vida') {
    adminContent = (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input value={userSearch} onChange={(event) => setUserSearch(event.target.value)} placeholder="Buscar Vida por nome, CPF ou e-mail" className="w-full rounded-xl border border-white/15 bg-slate-900/70 py-2 pl-9 pr-3 text-sm" />
          </div>
          <button className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-on-primary" onClick={() => setShowNewUserForm((prev) => !prev)}>
            {showNewUserForm ? 'Cancelar' : 'Adicionar Vida'}
          </button>
        </div>

        {showNewUserForm ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <div className="grid gap-2 md:grid-cols-2">
              <input className="rounded-xl border border-white/15 bg-slate-900/70 px-3 py-2" placeholder="Nome completo" value={newUserDraft.fullName} onChange={(e) => setNewUserDraft((prev) => ({ ...prev, fullName: e.target.value }))} />
              <input className="rounded-xl border border-white/15 bg-slate-900/70 px-3 py-2" placeholder="CPF" value={newUserDraft.cpf} onChange={(e) => setNewUserDraft((prev) => ({ ...prev, cpf: formatCpf(e.target.value) }))} />
              <input className="rounded-xl border border-white/15 bg-slate-900/70 px-3 py-2" placeholder="E-mail" value={newUserDraft.email} onChange={(e) => setNewUserDraft((prev) => ({ ...prev, email: e.target.value }))} />
              <input className="rounded-xl border border-white/15 bg-slate-900/70 px-3 py-2" placeholder="Telefone" value={newUserDraft.phone} onChange={(e) => setNewUserDraft((prev) => ({ ...prev, phone: e.target.value }))} />
              <input className="rounded-xl border border-white/15 bg-slate-900/70 px-3 py-2" placeholder="CEP" value={newUserDraft.cep} onChange={(e) => setNewUserDraft((prev) => ({ ...prev, cep: e.target.value }))} />
              <input className="rounded-xl border border-white/15 bg-slate-900/70 px-3 py-2" placeholder="Cidade" value={newUserDraft.city} onChange={(e) => setNewUserDraft((prev) => ({ ...prev, city: e.target.value }))} />
              <input className="rounded-xl border border-white/15 bg-slate-900/70 px-3 py-2 md:col-span-2" placeholder="Código do estudante" value={newUserDraft.studentCode} onChange={(e) => setNewUserDraft((prev) => ({ ...prev, studentCode: e.target.value }))} />
              <select className="rounded-xl border border-white/15 bg-slate-900/70 px-3 py-2 md:col-span-2" value={newUserDraft.status} onChange={(e) => setNewUserDraft((prev) => ({ ...prev, status: e.target.value as UserAccountStatus }))}>
                <option value="ATIVO">ATIVO</option>
                <option value="INATIVO">INATIVO</option>
                <option value="PENDENTE">PENDENTE</option>
                <option value="BLOQUEADO">BLOQUEADO</option>
              </select>
            </div>

            <div className="mt-3 rounded-xl border border-white/10 bg-slate-900/60 p-3">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-white">Dependentes (até {MAX_DEPENDENTS})</h4>
                <button type="button" className="text-xs font-semibold text-primary disabled:cursor-not-allowed disabled:opacity-60" onClick={addDependentToDraft} disabled={newUserDraft.dependents.length >= MAX_DEPENDENTS}>
                  Adicionar
                </button>
              </div>
              <div className="space-y-2">
                {newUserDraft.dependents.map((dep) => (
                  <div key={dep.id} className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
                    <input className="rounded-lg border border-white/15 bg-slate-900/70 px-2 py-1.5 text-xs" placeholder="Nome dependente" value={dep.name} onChange={(e) => updateDraftDependent(dep.id, { name: e.target.value })} />
                    <input className="rounded-lg border border-white/15 bg-slate-900/70 px-2 py-1.5 text-xs" placeholder="CPF dependente" value={formatCpf(dep.cpf)} onChange={(e) => updateDraftDependent(dep.id, { cpf: formatCpf(e.target.value) })} />
                    <button type="button" className="rounded-lg border border-rose-300/30 px-2 py-1.5 text-xs text-rose-300" onClick={() => removeDraftDependent(dep.id)}>
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button className="mt-3 w-full rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-on-primary" onClick={handleAdminCreateUser}>
              Salvar usuário Vida
            </button>
          </div>
        ) : null}

        <div className="hidden overflow-hidden rounded-2xl border border-white/10 md:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.04] text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-3 py-2">Nome</th>
                <th className="px-3 py-2">CPF</th>
                <th className="px-3 py-2">Cidade</th>
                <th className="px-3 py-2">Dependentes</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {userFiltered.length ? (
                userFiltered.map((user) => (
                  <tr key={user.id} className="border-t border-white/10">
                    <td className="px-3 py-2">{user.fullName}</td>
                    <td className="px-3 py-2 text-slate-300">{formatCpf(user.cpf)}</td>
                    <td className="px-3 py-2 text-slate-300">{user.city || '-'}</td>
                    <td className="px-3 py-2 text-slate-300">{user.dependents.length}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={user.status} />
                        <select className="rounded-lg border border-white/15 bg-slate-900/70 px-2 py-1 text-xs" value={user.status} onChange={(e) => updateUserStatus(user.id, e.target.value as UserAccountStatus)}>
                          <option value="ATIVO">ATIVO</option>
                          <option value="INATIVO">INATIVO</option>
                          <option value="PENDENTE">PENDENTE</option>
                          <option value="BLOQUEADO">BLOQUEADO</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="border-t border-white/10">
                  <td colSpan={5} className="px-3 py-6 text-center text-sm text-slate-400">
                    Nenhum cadastro Vida encontrado para o filtro atual.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="space-y-2 md:hidden">
          {userFiltered.length ? (
            userFiltered.map((user) => (
              <article key={user.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-white">{user.fullName}</p>
                  <StatusBadge status={user.status} />
                </div>
                <p className="mt-1 text-xs text-slate-300">{formatCpf(user.cpf)}</p>
                <p className="text-xs text-slate-400">
                  {user.city || 'Cidade não informada'} • {user.dependents.length} dependente(s)
                </p>
                <div className="mt-2">
                  <select className="w-full rounded-lg border border-white/15 bg-slate-900/70 px-2 py-1 text-xs" value={user.status} onChange={(e) => updateUserStatus(user.id, e.target.value as UserAccountStatus)}>
                    <option value="ATIVO">ATIVO</option>
                    <option value="INATIVO">INATIVO</option>
                    <option value="PENDENTE">PENDENTE</option>
                    <option value="BLOQUEADO">BLOQUEADO</option>
                  </select>
                </div>
              </article>
            ))
          ) : (
            <p className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-4 text-center text-sm text-slate-400">
              Nenhum cadastro Vida encontrado para o filtro atual.
            </p>
          )}
        </div>
      </div>
    )
  }

  if (currentPath === '/admin/parceiros') {
    adminContent = (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input value={partnerSearch} onChange={(event) => setPartnerSearch(event.target.value)} placeholder="Buscar por parceiro, categoria ou cidade" className="w-full rounded-xl border border-white/15 bg-slate-900/70 py-2 pl-9 pr-3 text-sm" />
          </div>
          <button className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-on-primary" onClick={() => navigate('/admin/parceiros/novo')}>Novo parceiro</button>
        </div>

        <div className="hidden overflow-hidden rounded-2xl border border-white/10 md:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.04] text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-3 py-2">Parceiro</th>
                <th className="px-3 py-2">Categoria</th>
                <th className="px-3 py-2">Região</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Mapa/Ofertas</th>
                <th className="px-3 py-2">Ação</th>
              </tr>
            </thead>
            <tbody>
              {partnerFiltered.length ? (
                partnerFiltered.map((partner) => (
                  <tr key={partner.id} className="border-t border-white/10">
                    <td className="px-3 py-2">{partner.name}</td>
                    <td className="px-3 py-2 text-slate-300">{partner.category}</td>
                    <td className="px-3 py-2 text-slate-300">{formatRegionLabel(partner.region)}</td>
                    <td className="px-3 py-2"><StatusBadge status={partner.status} /></td>
                    <td className="px-3 py-2 text-xs text-slate-400">{partner.showOnMap ? 'Mapa' : '-'} / {partner.showOnOffers ? 'Ofertas' : '-'}</td>
                    <td className="px-3 py-2"><button className="text-primary" onClick={() => navigate(`/admin/parceiros/${partner.id}`)}>Editar</button></td>
                  </tr>
                ))
              ) : (
                <tr className="border-t border-white/10">
                  <td colSpan={6} className="px-3 py-6 text-center text-sm text-slate-400">
                    Nenhum parceiro encontrado. Cadastre o primeiro parceiro para liberar mapa e ofertas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="space-y-2 md:hidden">
          {partnerFiltered.length ? (
            partnerFiltered.map((partner) => (
              <article key={partner.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-white">{partner.name}</p>
                  <StatusBadge status={partner.status} />
                </div>
                <p className="mt-1 text-xs text-slate-300">{partner.category}</p>
                <p className="text-xs text-slate-400">{formatRegionLabel(partner.region)} • {partner.city || 'Cidade não informada'}</p>
                <p className="mt-1 text-xs text-slate-400">{partner.showOnMap ? 'Mapa' : '-'} / {partner.showOnOffers ? 'Ofertas' : '-'}</p>
                <button className="mt-2 text-sm text-primary" onClick={() => navigate(`/admin/parceiros/${partner.id}`)}>
                  Editar
                </button>
              </article>
            ))
          ) : (
            <p className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-4 text-center text-sm text-slate-400">
              Nenhum parceiro encontrado. Cadastre o primeiro parceiro para liberar mapa e ofertas.
            </p>
          )}
        </div>
      </div>
    )
  }

  if (currentPath === '/admin/parceiros/novo' || selectedPartner) {
    const editing = Boolean(selectedPartner)
    const base = selectedPartner ?? {
      id: '',
      name: '',
      cnpj: '',
      category: '',
      phone: '',
      address: '',
      city: '',
      region: 'UNASP' as Region,
      lat: -22.48,
      lng: -47.21,
      status: 'ATIVO' as PartnerStatus,
      showOnMap: true,
      showOnOffers: true,
      logo: 'https://picsum.photos/seed/euplus-new-partner/320/220',
    }

    adminContent = (
      <PartnerEditor
        key={editing ? base.id : 'new'}
        partner={base}
        editing={editing}
        onBack={() => navigate('/admin/parceiros')}
        onSave={(record) => {
          dashboardFetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'savePartner', partner: record }),
          })
            .then((response) => readApiBody(response, 'Falha ao salvar parceiro.'))
            .then((data) => {
              if (!data.ok) throw new Error(data.error || 'Falha ao salvar parceiro.')
              return loadDashboardData()
            })
            .then(() => navigate('/admin/parceiros'))
            .catch((error) => setAuthError(error instanceof Error ? error.message : 'Falha ao salvar parceiro.'))
        }}
      />
    )
  }

  if (currentPath === '/admin/ofertas') {
    adminContent = (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input value={offerSearch} onChange={(event) => setOfferSearch(event.target.value)} placeholder="Buscar por oferta ou parceiro" className="w-full rounded-xl border border-white/15 bg-slate-900/70 py-2 pl-9 pr-3 text-sm" />
          </div>
          <button className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-on-primary" onClick={() => navigate('/admin/ofertas/nova')}>Nova oferta</button>
        </div>

        <div className="hidden overflow-hidden rounded-2xl border border-white/10 md:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.04] text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-3 py-2">Oferta</th>
                <th className="px-3 py-2">Parceiro</th>
                <th className="px-3 py-2">Desconto</th>
                <th className="px-3 py-2">Vigência</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Ação</th>
              </tr>
            </thead>
            <tbody>
              {offerFiltered.map((offer) => {
                const partner = partners.find((item) => item.id === offer.partnerId)
                return (
                  <tr key={offer.id} className="border-t border-white/10">
                    <td className="px-3 py-2">{offer.title}</td>
                    <td className="px-3 py-2 text-slate-300">{partner?.name ?? '-'}</td>
                    <td className="px-3 py-2 text-primary">{offer.discount}%</td>
                    <td className="px-3 py-2 text-slate-300">{offer.validUntil}</td>
                    <td className="px-3 py-2"><StatusBadge status={offer.status} /></td>
                    <td className="px-3 py-2"><button className="text-primary" onClick={() => navigate(`/admin/ofertas/${offer.id}`)}>Editar</button></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  if (currentPath === '/admin/ofertas/nova' || selectedOffer) {
    const editing = Boolean(selectedOffer)
    const baseOffer =
      selectedOffer ?? {
        id: '',
        partnerId: partners[0]?.id ?? '',
        title: '',
        description: '',
        discount: 10,
        validUntil: '2026-12-31',
        status: 'ATIVA' as OfferStatus,
        image: 'https://picsum.photos/seed/euplus-new-offer/640/420',
      }

    adminContent = (
      <OfferEditor
        key={editing ? baseOffer.id : 'new-offer'}
        offer={baseOffer}
        partners={partners}
        editing={editing}
        onBack={() => navigate('/admin/ofertas')}
        onSave={(record) => {
          dashboardFetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'saveOffer', offer: record }),
          })
            .then((response) => readApiBody(response, 'Falha ao salvar oferta.'))
            .then((data) => {
              if (!data.ok) throw new Error(data.error || 'Falha ao salvar oferta.')
              return loadDashboardData()
            })
            .then(() => navigate('/admin/ofertas'))
            .catch((error) => setAuthError(error instanceof Error ? error.message : 'Falha ao salvar oferta.'))
        }}
      />
    )
  }

  if (currentPath === '/admin/auditoria') {
    adminContent = (
      <div className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <h2 className="text-sm font-semibold">Logs de auditoria</h2>
          <p className="text-xs text-slate-400">Rastreabilidade de ações da equipe interna.</p>
        </div>
        <div className="space-y-2">
          {auditLogs.map((log) => (
            <article key={log.id} className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2">
              <p className="text-sm text-white"><span className="font-semibold">{log.actor}</span> • {log.action}</p>
              <p className="text-sm text-slate-300">{log.target}</p>
              <p className="text-xs text-slate-500">{log.createdAt}</p>
            </article>
          ))}
        </div>
      </div>
    )
  }

  if (!adminContent) {
    navigate('/admin/dashboard')
    return null
  }

  return (
    <Shell
      title={`Painel Admin • ${currentAdmin?.name ?? 'Equipe Euplus'}`}
      subtitle="Gestão de alunos, pessoas físicas, parceiros, ofertas e governança de dados."
      nav={adminNav}
      currentPath={currentPath}
      onNavigate={navigate}
      onLogout={logout}
      mobileItems={adminNav.slice(0, 4)}
    >
      {authError ? <p className="mb-4 rounded-xl border border-rose-300/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">{authError}</p> : null}
      {adminContent}
    </Shell>
  )
}
function PartnerEditor({
  partner,
  editing,
  onBack,
  onSave,
}: {
  partner: PartnerRecord
  editing: boolean
  onBack: () => void
  onSave: (partner: PartnerRecord) => void
}) {
  const [draft, setDraft] = useState(partner)

  return (
    <div className="space-y-4">
      <button className="text-sm text-primary" onClick={onBack}>
        ← Voltar para parceiros
      </button>
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <h2 className="text-lg font-semibold">{editing ? 'Editar parceiro' : 'Novo parceiro'}</h2>
        <p className="text-xs text-slate-400">Cadastro utilizado no mapa e nas ofertas do dia.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Nome da loja</label>
            <input
              value={draft.name}
              onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))}
              className="w-full rounded-xl border border-white/15 bg-slate-900/70 px-3 py-2"
              placeholder="Nome da loja"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">CNPJ</label>
            <input
              value={draft.cnpj}
              onChange={(event) => setDraft((prev) => ({ ...prev, cnpj: event.target.value }))}
              className="w-full rounded-xl border border-white/15 bg-slate-900/70 px-3 py-2"
              placeholder="CNPJ"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Categoria</label>
            <input
              value={draft.category}
              onChange={(event) => setDraft((prev) => ({ ...prev, category: event.target.value }))}
              className="w-full rounded-xl border border-white/15 bg-slate-900/70 px-3 py-2"
              placeholder="Categoria"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Telefone</label>
            <input
              value={draft.phone}
              onChange={(event) => setDraft((prev) => ({ ...prev, phone: event.target.value }))}
              className="w-full rounded-xl border border-white/15 bg-slate-900/70 px-3 py-2"
              placeholder="Telefone"
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-medium text-slate-300">Endereço</label>
            <input
              value={draft.address}
              onChange={(event) => setDraft((prev) => ({ ...prev, address: event.target.value }))}
              className="w-full rounded-xl border border-white/15 bg-slate-900/70 px-3 py-2"
              placeholder="Endereço"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Cidade</label>
            <input
              value={draft.city}
              onChange={(event) => setDraft((prev) => ({ ...prev, city: event.target.value }))}
              className="w-full rounded-xl border border-white/15 bg-slate-900/70 px-3 py-2"
              placeholder="Cidade"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Região</label>
            <select
              value={draft.region}
              onChange={(event) => setDraft((prev) => ({ ...prev, region: event.target.value as Region }))}
              className="w-full rounded-xl border border-white/15 bg-slate-900/70 px-3 py-2"
            >
              <option value="UNASP">UNASP</option>
              <option value="UNIAENE">UNIAENE</option>
              <option value="IAP">FAP</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Latitude</label>
            <input
              value={draft.lat}
              onChange={(event) => setDraft((prev) => ({ ...prev, lat: Number(event.target.value) || 0 }))}
              className="w-full rounded-xl border border-white/15 bg-slate-900/70 px-3 py-2"
              placeholder="Latitude"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Longitude</label>
            <input
              value={draft.lng}
              onChange={(event) => setDraft((prev) => ({ ...prev, lng: Number(event.target.value) || 0 }))}
              className="w-full rounded-xl border border-white/15 bg-slate-900/70 px-3 py-2"
              placeholder="Longitude"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Status do parceiro</label>
            <select
              value={draft.status}
              onChange={(event) => setDraft((prev) => ({ ...prev, status: event.target.value as PartnerStatus }))}
              className="w-full rounded-xl border border-white/15 bg-slate-900/70 px-3 py-2"
            >
              <option value="ATIVO">ATIVO</option>
              <option value="INATIVO">INATIVO</option>
            </select>
          </div>
          <div className="flex items-center gap-5 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={draft.showOnMap}
                onChange={(event) => setDraft((prev) => ({ ...prev, showOnMap: event.target.checked }))}
              />
              Aparece no mapa
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={draft.showOnOffers}
                onChange={(event) => setDraft((prev) => ({ ...prev, showOnOffers: event.target.checked }))}
              />
              Aparece em ofertas
            </label>
          </div>
        </div>

        <button
          className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-on-primary"
          onClick={() => onSave(draft)}
        >
          {editing ? 'Salvar alterações' : 'Cadastrar parceiro'}
        </button>
      </div>
    </div>
  )
}

function OfferEditor({
  offer,
  partners,
  editing,
  onBack,
  onSave,
}: {
  offer: OfferRecord
  partners: PartnerRecord[]
  editing: boolean
  onBack: () => void
  onSave: (offer: OfferRecord) => void
}) {
  const [draft, setDraft] = useState(offer)

  return (
    <div className="space-y-4">
      <button className="text-sm text-primary" onClick={onBack}>
        ← Voltar para ofertas
      </button>
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <h2 className="text-lg font-semibold">{editing ? 'Editar oferta' : 'Nova oferta'}</h2>
        <p className="text-xs text-slate-400">Oferta vinculada a parceiro com status ativo.</p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Parceiro</label>
            <select
              value={draft.partnerId}
              onChange={(event) => setDraft((prev) => ({ ...prev, partnerId: event.target.value }))}
              className="w-full rounded-xl border border-white/15 bg-slate-900/70 px-3 py-2"
            >
              {partners.map((partner) => (
                <option key={partner.id} value={partner.id}>
                  {partner.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Título da oferta</label>
            <input
              value={draft.title}
              onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
              className="w-full rounded-xl border border-white/15 bg-slate-900/70 px-3 py-2"
              placeholder="Título da oferta"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Percentual de desconto</label>
            <input
              value={draft.discount}
              onChange={(event) => setDraft((prev) => ({ ...prev, discount: Number(event.target.value) || 0 }))}
              className="w-full rounded-xl border border-white/15 bg-slate-900/70 px-3 py-2"
              placeholder="Percentual de desconto"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Vigência</label>
            <input
              value={draft.validUntil}
              onChange={(event) => setDraft((prev) => ({ ...prev, validUntil: event.target.value }))}
              className="w-full rounded-xl border border-white/15 bg-slate-900/70 px-3 py-2"
              placeholder="Vigência"
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-medium text-slate-300">URL da imagem</label>
            <input
              value={draft.image}
              onChange={(event) => setDraft((prev) => ({ ...prev, image: event.target.value }))}
              className="w-full rounded-xl border border-white/15 bg-slate-900/70 px-3 py-2"
              placeholder="URL da imagem"
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-medium text-slate-300">Descrição da oferta</label>
            <textarea
              value={draft.description}
              onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))}
              className="min-h-[90px] w-full rounded-xl border border-white/15 bg-slate-900/70 px-3 py-2"
              placeholder="Descrição da oferta"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Status da oferta</label>
            <select
              value={draft.status}
              onChange={(event) => setDraft((prev) => ({ ...prev, status: event.target.value as OfferStatus }))}
              className="w-full rounded-xl border border-white/15 bg-slate-900/70 px-3 py-2"
            >
              <option value="ATIVA">ATIVA</option>
              <option value="PAUSADA">PAUSADA</option>
              <option value="ENCERRADA">ENCERRADA</option>
            </select>
          </div>
        </div>

        <button
          className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-on-primary"
          onClick={() => onSave(draft)}
        >
          {editing ? 'Salvar oferta' : 'Cadastrar oferta'}
        </button>
      </div>
    </div>
  )
}

export default DashboardApp
