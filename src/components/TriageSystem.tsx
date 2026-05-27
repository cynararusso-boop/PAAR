import { useState, useCallback } from 'react'
import { salvarTriagem } from '../lib/googleSheets'

// --- Types ---
interface FormState {
  // 1. Cabeçalho e Perfil
  hospital: string
  setor: string
  data: string
  idPaciente: string
  profissional: string
  nomePaciente: string
  idade: string
  diagnosticoPrincipal: string
  sexo: string
  primeiraVez: string
  atendimentoInclusivo: string
  diagTEA: boolean
  diagTDAH: boolean
  diagDI: boolean
  diagDown: boolean
  diagOutro: boolean
  diagOutroTexto: string
  // 2. Comunicação e Perfil Sensorial
  perfilComunicacao: string
  perfilToque: string
  // 3. Hipersensibilidades (+1 each)
  hipLuz: boolean
  hipRuido: boolean
  hipToque: boolean
  hipCheiros: boolean
  hipAmbientesCheios: boolean
  hipEsperaProlongada: boolean
  hipMudancaRotina: boolean
  hipProcedimentosInvasivos: boolean
  hipTemperatura: boolean
  // 4. Sinais de Alerta e Risco (+2 each, exceptions noted)
  sinalAnsiedade: boolean
  sinalAgitacao: boolean
  sinalChoroIntenso: boolean
  sinalTremores: boolean
  sinalTentativaFuga: boolean
  sinalAutoagressao: boolean
  sinalAversaoSensorial: boolean
  sinalIsolamento: boolean
  sinalAgressividade: boolean
  sinalRigidez: boolean
  sinalVocalizacao: boolean
  sinalResistencia: boolean
  sinalHipervigilancia: boolean
  sinalOutro: boolean
  // 5. Nível de Desregulação e Riscos
  desregulacao: string
  riscoFuga: boolean
  riscoAutoagressao: boolean
  riscoQueda: boolean
  riscoAgressividade: boolean
  riscoOutro: boolean
  // 6. Estratégias Preventivas
  estratReducaoEstimulo: boolean
  estratAmbienteSilencioso: boolean
  estratReducaoIluminacao: boolean
  estratAnticipacaoVerbal: boolean
  estratCobertor: boolean
  estratAbafador: boolean
  estratOculosEscuros: boolean
  estratTempoAdaptacao: boolean
  estratComunicacaoVisual: boolean
  estratObjetoConforto: boolean
  estratOutros: boolean
  estratOutrosTexto: string
  // 7. Medicação Domiciliar
  medicacaoContinua: string
  medicacaoQual: string
  // 8. Registro de Intervenção e Desfecho
  intervManejoAmbiental: boolean
  intervReducaoEstimulos: boolean
  intervRealocacao: boolean
  intervPausaRegulatoria: boolean
  intervComunicacaoAntecipatoria: boolean
  intervContencaoFisica: boolean
  intervFarmacologica: boolean
  intervMedicamentoAdministrado: string
  desfechoApenasManejo: boolean
  desfechoCriseEvitada: boolean
  desfechoCriseControlada: boolean
  desfechoCriseContencao: boolean
  desfechoAtendimentoConcluido: boolean
  desfechoFarmacologicaDesfecho: boolean
  desfechoEquipeAmpliada: boolean
  // 9. Avaliação Pós-Atendimento (1–5 each)
  avalClareza: number
  avalFacilidade: number
  avalImproviso: number
  avalSeguranca: number
  avalBeneficio: number
  // 10. Termo de Consentimento
  termoAceito: boolean
  assinaturaDigital: string
  dataAssinatura: string
}

const initialState: FormState = {
  hospital: '',
  setor: '',
  data: '',
  idPaciente: '',
  profissional: '',
  nomePaciente: '',
  idade: '',
  diagnosticoPrincipal: '',
  sexo: '',
  primeiraVez: '',
  atendimentoInclusivo: '',
  diagTEA: false,
  diagTDAH: false,
  diagDI: false,
  diagDown: false,
  diagOutro: false,
  diagOutroTexto: '',
  perfilComunicacao: '',
  perfilToque: '',
  hipLuz: false,
  hipRuido: false,
  hipToque: false,
  hipCheiros: false,
  hipAmbientesCheios: false,
  hipEsperaProlongada: false,
  hipMudancaRotina: false,
  hipProcedimentosInvasivos: false,
  hipTemperatura: false,
  sinalAnsiedade: false,
  sinalAgitacao: false,
  sinalChoroIntenso: false,
  sinalTremores: false,
  sinalTentativaFuga: false,
  sinalAutoagressao: false,
  sinalAversaoSensorial: false,
  sinalIsolamento: false,
  sinalAgressividade: false,
  sinalRigidez: false,
  sinalVocalizacao: false,
  sinalResistencia: false,
  sinalHipervigilancia: false,
  sinalOutro: false,
  desregulacao: '',
  riscoFuga: false,
  riscoAutoagressao: false,
  riscoQueda: false,
  riscoAgressividade: false,
  riscoOutro: false,
  estratReducaoEstimulo: false,
  estratAmbienteSilencioso: false,
  estratReducaoIluminacao: false,
  estratAnticipacaoVerbal: false,
  estratCobertor: false,
  estratAbafador: false,
  estratOculosEscuros: false,
  estratTempoAdaptacao: false,
  estratComunicacaoVisual: false,
  estratObjetoConforto: false,
  estratOutros: false,
  estratOutrosTexto: '',
  medicacaoContinua: 'nao',
  medicacaoQual: '',
  intervManejoAmbiental: false,
  intervReducaoEstimulos: false,
  intervRealocacao: false,
  intervPausaRegulatoria: false,
  intervComunicacaoAntecipatoria: false,
  intervContencaoFisica: false,
  intervFarmacologica: false,
  intervMedicamentoAdministrado: '',
  desfechoApenasManejo: false,
  desfechoCriseEvitada: false,
  desfechoCriseControlada: false,
  desfechoCriseContencao: false,
  desfechoAtendimentoConcluido: false,
  desfechoFarmacologicaDesfecho: false,
  desfechoEquipeAmpliada: false,
  avalClareza: 0,
  avalFacilidade: 0,
  avalImproviso: 0,
  avalSeguranca: 0,
  avalBeneficio: 0,
  termoAceito: false,
  assinaturaDigital: '',
  dataAssinatura: '',
}

function calcScore(s: FormState): number {
  let score = 0
  // Hipersensibilidades (+1 each)
  if (s.hipLuz) score += 1
  if (s.hipRuido) score += 1
  if (s.hipToque) score += 1
  if (s.hipCheiros) score += 1
  if (s.hipAmbientesCheios) score += 1
  if (s.hipEsperaProlongada) score += 1
  if (s.hipMudancaRotina) score += 1
  if (s.hipProcedimentosInvasivos) score += 1
  if (s.hipTemperatura) score += 1
  // Sinais de Alerta (+2 default, exceptions: fuga +3, autoagressão +4)
  if (s.sinalAnsiedade) score += 2
  if (s.sinalAgitacao) score += 2
  if (s.sinalChoroIntenso) score += 2
  if (s.sinalTremores) score += 2
  if (s.sinalTentativaFuga) score += 3
  if (s.sinalAutoagressao) score += 4
  if (s.sinalAversaoSensorial) score += 2
  if (s.sinalIsolamento) score += 2
  if (s.sinalAgressividade) score += 2
  if (s.sinalRigidez) score += 2
  if (s.sinalVocalizacao) score += 2
  if (s.sinalResistencia) score += 2
  if (s.sinalHipervigilancia) score += 2
  if (s.sinalOutro) score += 2
  // Desregulação Grave (+5)
  if (s.desregulacao === 'grave') score += 5
  return score
}

type RiskLevel = 'waiting' | 'green' | 'yellow' | 'orange' | 'red'

function getRiskLevel(score: number): RiskLevel {
  if (score === 0) return 'waiting'
  if (score <= 5) return 'green'
  if (score <= 12) return 'yellow'
  if (score <= 20) return 'orange'
  return 'red'
}

const riskConfig = {
  waiting: {
    bg: 'bg-slate-100',
    border: 'border-slate-300',
    text: 'text-slate-600',
    badge: 'bg-slate-200 text-slate-700',
    label: 'AGUARDANDO TRIAGEM',
    icon: '⏳',
    tips: [],
  },
  green: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-400',
    text: 'text-emerald-800',
    badge: 'bg-emerald-500 text-white',
    label: 'VERDE – BAIXO RISCO',
    icon: '🟢',
    tips: [
      'Oferecer ambiente calmo e pouco estimulante',
      'Comunicação clara, direta e em tom de voz baixo',
      'Permitir objeto de conforto sensorial se disponível',
      'Respeitar espaço pessoal do paciente',
      'Monitorar sinais de escalada a cada 30 min',
    ],
  },
  yellow: {
    bg: 'bg-amber-50',
    border: 'border-amber-400',
    text: 'text-amber-900',
    badge: 'bg-amber-500 text-white',
    label: 'AMARELO – MANEJO PREVENTIVO MODERADO',
    icon: '🟡',
    tips: [
      'Reduzir estímulos: luz, som e movimentação ao redor',
      'Acionar TO ou Psicologia para suporte sensorial ativo',
      'Oferecer regulação sensorial (peso, textura, fone abafador)',
      'Evitar procedimentos não urgentes até estabilização',
      'Comunicar equipe sobre estado do paciente',
      'Reavaliar score a cada 15 min',
    ],
  },
  orange: {
    bg: 'bg-orange-50',
    border: 'border-orange-400',
    text: 'text-orange-900',
    badge: 'bg-orange-600 text-white',
    label: 'LARANJA – ALTO RISCO DE ESCALONAMENTO',
    icon: '🟠',
    tips: [
      'Acionar coordenação e equipe multidisciplinar IMEDIATAMENTE',
      'Isolar paciente em sala de menor estimulação',
      'Aplicar técnicas de contenção sensorial não física',
      'Comunicação mínima e previsível; um único interlocutor',
      'Preparar plano de contenção física preventiva se necessário',
      'Documentar todas as intervenções em tempo real',
      'Reavaliar score a cada 5 min',
    ],
  },
  red: {
    bg: 'bg-red-50',
    border: 'border-red-500',
    text: 'text-red-900',
    badge: 'bg-red-600 text-white',
    label: 'VERMELHO – RISCO CRÍTICO / ALERTA CENTRAL',
    icon: '🔴',
    tips: [
      '🚨 ALERTA CENTRAL: Acionar coordenação central e segurança',
      'Contenção física apenas se risco iminente – protocolo institucional',
      'Dois profissionais presentes no mínimo',
      'Comunicação ultra-reduzida; evitar contato visual direto',
      'Medicação de emergência: avaliar com médico plantonista',
      'Registrar início da crise, intervenções e resposta do paciente',
      'Pós-crise: debriefing sensorial obrigatório com equipe',
      'Notificar família/responsável imediatamente',
    ],
  },
}

// --- Sub-components ---

function SectionCard({
  title,
  icon,
  subtitle,
  children,
  accentColor = 'slate',
}: {
  title: string
  icon: string
  subtitle?: string
  children: React.ReactNode
  accentColor?: 'slate' | 'blue' | 'amber' | 'red' | 'green' | 'purple'
}) {
  const headerColors = {
    slate: 'bg-slate-700',
    blue: 'bg-blue-700',
    amber: 'bg-amber-600',
    red: 'bg-red-700',
    green: 'bg-emerald-700',
    purple: 'bg-purple-700',
  }
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className={`${headerColors[accentColor]} px-5 py-4 flex items-start gap-3`}>
        <span className="text-xl mt-0.5 flex-shrink-0">{icon}</span>
        <div>
          <h2 className="text-white font-semibold text-sm tracking-wide uppercase leading-tight">{title}</h2>
          {subtitle && <p className="text-white/60 text-xs mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function ToggleCheckbox({
  checked,
  onChange,
  label,
  points,
  color = 'blue',
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  points: string
  color?: 'blue' | 'amber' | 'red' | 'green' | 'purple'
}) {
  const colors = {
    blue: checked
      ? 'bg-blue-600 border-blue-600 text-white'
      : 'bg-white border-slate-200 text-slate-700 hover:border-blue-400',
    amber: checked
      ? 'bg-amber-500 border-amber-500 text-white'
      : 'bg-white border-slate-200 text-slate-700 hover:border-amber-400',
    red: checked
      ? 'bg-red-600 border-red-600 text-white'
      : 'bg-white border-slate-200 text-slate-700 hover:border-red-400',
    green: checked
      ? 'bg-emerald-600 border-emerald-600 text-white'
      : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-400',
    purple: checked
      ? 'bg-purple-600 border-purple-600 text-white'
      : 'bg-white border-slate-200 text-slate-700 hover:border-purple-400',
  }

  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all duration-150 cursor-pointer select-none ${colors[color]}`}
      aria-pressed={checked}
    >
      <span className="font-medium text-sm text-left leading-snug flex items-center gap-2">
        <span
          className={`w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center transition-all ${
            checked ? 'bg-white/30 border-white/60' : 'border-slate-300 bg-white'
          }`}
        >
          {checked && (
            <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="none">
              <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
        {label}
      </span>
      <span
        className={`ml-3 flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${
          checked ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
        }`}
      >
        {points}
      </span>
    </button>
  )
}

function RadioGroup({
  options,
  value,
  onChange,
  columns = 2,
}: {
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
  columns?: number
}) {
  const gridClass =
    columns === 1
      ? 'grid-cols-1'
      : columns === 2
        ? 'grid-cols-1 sm:grid-cols-2'
        : columns === 3
          ? 'grid-cols-1 sm:grid-cols-3'
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'

  return (
    <div className={`grid ${gridClass} gap-2`}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all text-left ${
            value === opt.value
              ? 'bg-blue-600 border-blue-600 text-white'
              : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300'
          }`}
        >
          <span
            className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
              value === opt.value ? 'border-white bg-white/20' : 'border-slate-300'
            }`}
          >
            {value === opt.value && <span className="w-2 h-2 rounded-full bg-white" />}
          </span>
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function ScalePicker({
  value,
  onChange,
  label,
}: {
  value: number
  onChange: (v: number) => void
  label: string
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      <span className="text-sm text-slate-700 font-medium flex-1">{label}</span>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`w-10 h-10 rounded-lg text-sm font-bold transition-all border-2 ${
              n <= value
                ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                : 'bg-white border-slate-200 text-slate-400 hover:border-blue-300 hover:text-blue-600'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}

function ScoreBadge({ score }: { score: number }) {
  const level = getRiskLevel(score)
  const cfg = riskConfig[level]

  return (
    <div
      className={`rounded-2xl border-2 p-5 transition-all duration-300 ${cfg.bg} ${cfg.border} ${
        level === 'red' ? 'animate-pulse' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-4 gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{cfg.icon}</span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-0.5">Score PAAR</p>
            <p className={`text-5xl font-black leading-none ${cfg.text}`}>{score}</p>
          </div>
        </div>
        <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${cfg.badge}`}>pontos</span>
      </div>

      <div className={`text-center py-2.5 px-4 rounded-xl font-bold text-sm tracking-wider ${cfg.badge}`}>
        {cfg.label}
      </div>

      {cfg.tips.length > 0 && (
        <div className="mt-4">
          <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${cfg.text}`}>Diretrizes de Manejo:</p>
          <ul className="space-y-1.5">
            {cfg.tips.map((tip, i) => (
              <li key={i} className={`text-xs flex items-start gap-2 ${cfg.text}`}>
                <span className="mt-0.5 flex-shrink-0">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4">
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>0</span>
          <span>5</span>
          <span>12</span>
          <span>20</span>
          <span>25+</span>
        </div>
        <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              level === 'waiting'
                ? 'bg-slate-400'
                : level === 'green'
                  ? 'bg-emerald-500'
                  : level === 'yellow'
                    ? 'bg-amber-500'
                    : level === 'orange'
                      ? 'bg-orange-500'
                      : 'bg-red-600'
            }`}
            style={{ width: `${Math.min((score / 25) * 100, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>Aguardando</span>
          <span>Verde</span>
          <span>Amarelo</span>
          <span>Laranja</span>
          <span>Vermelho</span>
        </div>
      </div>
    </div>
  )
}

// --- Main Component ---
export default function TriageSystem() {
  const [form, setForm] = useState<FormState>(initialState)
  const [submitted, setSubmitted] = useState(false)

  const set = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }, [])

  const score = calcScore(form)
  const level = getRiskLevel(score)

  const handleReset = () => {
    setForm(initialState)
    setSubmitted(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  await salvarTriagem({
    nomePaciente: form.nomePaciente,
    idade: form.idade,
    profissional: form.profissional,
    score: score,
    classificacao: riskConfig[level].label,
  })

  setSubmitted(true)

  window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const fieldClass =
    'w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-800 text-sm font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-colors'

  const labelClass = 'block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2'

  const sectionLabel = 'text-sm font-semibold text-slate-700 mb-3'

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-800 via-blue-900 to-slate-800 text-white shadow-xl">
        <div className="max-w-4xl mx-auto px-4 py-5">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-400/20 rounded-xl flex items-center justify-center text-2xl border border-blue-400/30">
              🏥
            </div>
            <div>
              <span className="text-xs font-bold tracking-widest uppercase text-blue-300 bg-blue-900/50 px-2 py-0.5 rounded">
                Santa Casa de Misericórdia de Itu – PSI
              </span>
              <h1 className="text-xl font-black tracking-tight mt-1 leading-tight">
                GUARDA-CHUVA
                <span className="text-blue-300 ml-2 font-light text-lg">PAAR / PSU DIGITAL</span>
              </h1>
              <p className="text-slate-300 text-xs mt-0.5">
                Triagem Sensorial para Pacientes Neurodivergentes · Protocolo PAAR V2
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Success Banner */}
      {submitted && (
        <div className="bg-emerald-600 text-white px-4 py-4 text-center">
          <p className="font-bold text-sm">✅ Triagem registrada com sucesso!</p>
          <button onClick={handleReset} className="mt-2 text-xs underline opacity-80 hover:opacity-100">
            Iniciar nova triagem
          </button>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        {/* Score Panel — sticky on md+ */}
        <div className="md:sticky md:top-4 md:z-10">
          <ScoreBadge score={score} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ── BLOCO 1: CABEÇALHO E PERFIL ── */}
          <SectionCard title="1. Cabeçalho e Perfil do Paciente" icon="📋" accentColor="slate">
            <div className="space-y-5">

              {/* Linha 1: Hospital, Setor, Data */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Hospital</label>
                  <input
                    type="text"
                    className={fieldClass}
                    placeholder="Nome do hospital"
                    value={form.hospital}
                    onChange={(e) => set('hospital', e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Setor</label>
                  <input
                    type="text"
                    className={fieldClass}
                    placeholder="Ex: UE, Internação..."
                    value={form.setor}
                    onChange={(e) => set('setor', e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Data</label>
                  <input
                    type="date"
                    className={fieldClass}
                    value={form.data}
                    onChange={(e) => set('data', e.target.value)}
                  />
                </div>
              </div>

              {/* Linha 2: ID, Profissional */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>ID do Paciente / Prontuário</label>
                  <input
                    type="text"
                    className={fieldClass}
                    placeholder="Número do prontuário"
                    value={form.idPaciente}
                    onChange={(e) => set('idPaciente', e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Profissional Responsável</label>
                  <input
                    type="text"
                    className={fieldClass}
                    placeholder="Nome e cargo"
                    value={form.profissional}
                    onChange={(e) => set('profissional', e.target.value)}
                  />
                </div>
              </div>

              {/* Linha 3: Nome, Idade */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Nome do Paciente</label>
                  <input
                    type="text"
                    className={fieldClass}
                    placeholder="Nome completo"
                    value={form.nomePaciente}
                    onChange={(e) => set('nomePaciente', e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Idade</label>
                  <input
                    type="text"
                    className={fieldClass}
                    placeholder="Ex: 8 anos"
                    value={form.idade}
                    onChange={(e) => set('idade', e.target.value)}
                  />
                </div>
              </div>

              {/* Diagnóstico / Queixa */}
              <div>
                <label className={labelClass}>Diagnóstico Principal / Queixa</label>
                <input
                  type="text"
                  className={fieldClass}
                  placeholder="Diagnóstico ou queixa principal"
                  value={form.diagnosticoPrincipal}
                  onChange={(e) => set('diagnosticoPrincipal', e.target.value)}
                />
              </div>

              {/* Sexo */}
              <div>
                <p className={sectionLabel}>Sexo</p>
                <RadioGroup
                  columns={4}
                  value={form.sexo}
                  onChange={(v) => set('sexo', v)}
                  options={[
                    { value: 'feminino', label: 'Feminino' },
                    { value: 'masculino', label: 'Masculino' },
                    { value: 'outro', label: 'Outro' },
                    { value: 'nao_informar', label: 'Prefere não informar' },
                  ]}
                />
              </div>

              {/* Histórico */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <p className={sectionLabel}>Primeira vez no hospital?</p>
                  <RadioGroup
                    columns={2}
                    value={form.primeiraVez}
                    onChange={(v) => set('primeiraVez', v)}
                    options={[
                      { value: 'sim', label: 'Sim' },
                      { value: 'nao', label: 'Não' },
                    ]}
                  />
                </div>
                <div>
                  <p className={sectionLabel}>Já recebeu atendimento inclusivo?</p>
                  <RadioGroup
                    columns={2}
                    value={form.atendimentoInclusivo}
                    onChange={(v) => set('atendimentoInclusivo', v)}
                    options={[
                      { value: 'sim', label: 'Sim' },
                      { value: 'nao', label: 'Não' },
                    ]}
                  />
                </div>
              </div>

              {/* Diagnóstico / Laudo */}
              <div>
                <p className={sectionLabel}>Diagnóstico / Laudo</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <ToggleCheckbox checked={form.diagTEA} onChange={(v) => set('diagTEA', v)} label="TEA" points="" color="purple" />
                  <ToggleCheckbox checked={form.diagTDAH} onChange={(v) => set('diagTDAH', v)} label="TDAH" points="" color="purple" />
                  <ToggleCheckbox checked={form.diagDI} onChange={(v) => set('diagDI', v)} label="Deficiência Intelectual" points="" color="purple" />
                  <ToggleCheckbox checked={form.diagDown} onChange={(v) => set('diagDown', v)} label="Síndrome de Down" points="" color="purple" />
                  <div className="sm:col-span-2 flex gap-2 items-center">
                    <div className="flex-shrink-0">
                      <ToggleCheckbox checked={form.diagOutro} onChange={(v) => set('diagOutro', v)} label="Outro" points="" color="purple" />
                    </div>
                    {form.diagOutro && (
                      <input
                        type="text"
                        className={`${fieldClass} flex-1`}
                        placeholder="Especificar..."
                        value={form.diagOutroTexto}
                        onChange={(e) => set('diagOutroTexto', e.target.value)}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* ── BLOCO 2: COMUNICAÇÃO E PERFIL SENSORIAL ── */}
          <SectionCard title="2. Comunicação e Perfil Sensorial" icon="💬" accentColor="blue">
            <div className="space-y-5">
              <div>
                <p className={sectionLabel}>Perfil de Comunicação</p>
                <RadioGroup
                  columns={2}
                  value={form.perfilComunicacao}
                  onChange={(v) => set('perfilComunicacao', v)}
                  options={[
                    { value: 'verbal', label: 'Verbal' },
                    { value: 'pouco_verbal', label: 'Pouco verbal' },
                    { value: 'nao_verbal', label: 'Não verbal' },
                    { value: 'caa', label: 'Comunicação Alternativa/Aumentativa – CAA' },
                  ]}
                />
              </div>
              <div>
                <p className={sectionLabel}>Toque Clínico</p>
                <RadioGroup
                  columns={2}
                  value={form.perfilToque}
                  onChange={(v) => set('perfilToque', v)}
                  options={[
                    { value: 'aceita', label: 'Aceita toque' },
                    { value: 'evitar_inesperado', label: 'Evitar toque inesperado' },
                    { value: 'recusa', label: 'Recusa toque' },
                    { value: 'apenas_aviso', label: 'Toque apenas com aviso' },
                  ]}
                />
              </div>
            </div>
          </SectionCard>

          {/* ── BLOCO 3: HIPERSENSIBILIDADES ── */}
          <SectionCard
            title="3. Hipersensibilidades"
            icon="⚡"
            subtitle="Peso +1 ponto no Score cada"
            accentColor="blue"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <ToggleCheckbox checked={form.hipLuz} onChange={(v) => set('hipLuz', v)} label="Luz" points="+1" color="blue" />
              <ToggleCheckbox checked={form.hipRuido} onChange={(v) => set('hipRuido', v)} label="Ruído" points="+1" color="blue" />
              <ToggleCheckbox checked={form.hipToque} onChange={(v) => set('hipToque', v)} label="Toque" points="+1" color="blue" />
              <ToggleCheckbox checked={form.hipCheiros} onChange={(v) => set('hipCheiros', v)} label="Cheiros" points="+1" color="blue" />
              <ToggleCheckbox checked={form.hipAmbientesCheios} onChange={(v) => set('hipAmbientesCheios', v)} label="Ambientes cheios" points="+1" color="blue" />
              <ToggleCheckbox checked={form.hipEsperaProlongada} onChange={(v) => set('hipEsperaProlongada', v)} label="Espera prolongada" points="+1" color="blue" />
              <ToggleCheckbox checked={form.hipMudancaRotina} onChange={(v) => set('hipMudancaRotina', v)} label="Mudança de rotina" points="+1" color="blue" />
              <ToggleCheckbox checked={form.hipProcedimentosInvasivos} onChange={(v) => set('hipProcedimentosInvasivos', v)} label="Procedimentos invasivos" points="+1" color="blue" />
              <ToggleCheckbox checked={form.hipTemperatura} onChange={(v) => set('hipTemperatura', v)} label="Temperatura" points="+1" color="blue" />
            </div>
          </SectionCard>

          {/* ── BLOCO 4: SINAIS DE ALERTA E RISCO ── */}
          <SectionCard
            title="4. Sinais de Alerta e Risco – Observados"
            icon="⚠️"
            subtitle="Peso +2 pontos no Score (exceções: Fuga +3, Autoagressão +4)"
            accentColor="amber"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <ToggleCheckbox checked={form.sinalAnsiedade} onChange={(v) => set('sinalAnsiedade', v)} label="Ansiedade" points="+2" color="amber" />
              <ToggleCheckbox checked={form.sinalAgitacao} onChange={(v) => set('sinalAgitacao', v)} label="Agitação" points="+2" color="amber" />
              <ToggleCheckbox checked={form.sinalChoroIntenso} onChange={(v) => set('sinalChoroIntenso', v)} label="Choro intenso" points="+2" color="amber" />
              <ToggleCheckbox checked={form.sinalTremores} onChange={(v) => set('sinalTremores', v)} label="Tremores" points="+2" color="amber" />
              <ToggleCheckbox checked={form.sinalTentativaFuga} onChange={(v) => set('sinalTentativaFuga', v)} label="Tentativa de fuga" points="+3" color="red" />
              <ToggleCheckbox checked={form.sinalAutoagressao} onChange={(v) => set('sinalAutoagressao', v)} label="Autoagressão" points="+4" color="red" />
              <ToggleCheckbox checked={form.sinalAversaoSensorial} onChange={(v) => set('sinalAversaoSensorial', v)} label="Aversão sensorial (tapar ouvidos/olhos)" points="+2" color="amber" />
              <ToggleCheckbox checked={form.sinalIsolamento} onChange={(v) => set('sinalIsolamento', v)} label="Isolamento" points="+2" color="amber" />
              <ToggleCheckbox checked={form.sinalAgressividade} onChange={(v) => set('sinalAgressividade', v)} label="Agressividade" points="+2" color="amber" />
              <ToggleCheckbox checked={form.sinalRigidez} onChange={(v) => set('sinalRigidez', v)} label="Rigidez comportamental" points="+2" color="amber" />
              <ToggleCheckbox checked={form.sinalVocalizacao} onChange={(v) => set('sinalVocalizacao', v)} label="Vocalização intensa" points="+2" color="amber" />
              <ToggleCheckbox checked={form.sinalResistencia} onChange={(v) => set('sinalResistencia', v)} label="Resistência ao ambiente/procedimento" points="+2" color="amber" />
              <ToggleCheckbox checked={form.sinalHipervigilancia} onChange={(v) => set('sinalHipervigilancia', v)} label="Hipervigilância" points="+2" color="amber" />
              <ToggleCheckbox checked={form.sinalOutro} onChange={(v) => set('sinalOutro', v)} label="Outro" points="+2" color="amber" />
            </div>
          </SectionCard>

          {/* ── Score Dinâmico (inline summary) ── */}
          <div className={`rounded-xl border-2 px-5 py-4 ${riskConfig[level].bg} ${riskConfig[level].border}`}>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Score Parcial</p>
                <p className={`text-2xl font-black ${riskConfig[level].text}`}>{score} pontos</p>
              </div>
              <span className={`text-xs font-bold px-4 py-2 rounded-full ${riskConfig[level].badge}`}>
                {riskConfig[level].label}
              </span>
            </div>
          </div>

          {/* ── BLOCO 5: NÍVEL DE DESREGULAÇÃO E RISCOS ── */}
          <SectionCard title="5. Nível de Desregulação e Riscos" icon="📊" accentColor="amber">
            <div className="space-y-5">
              <div>
                <p className={sectionLabel}>Grau de Desregulação</p>
                <RadioGroup
                  columns={3}
                  value={form.desregulacao}
                  onChange={(v) => set('desregulacao', v)}
                  options={[
                    { value: 'leve', label: 'Leve (0pt)' },
                    { value: 'moderada', label: 'Moderada (0pt)' },
                    { value: 'grave', label: 'Grave (+5 pts)' },
                  ]}
                />
              </div>
              <div>
                <p className={sectionLabel}>Risco de Segurança</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <ToggleCheckbox checked={form.riscoFuga} onChange={(v) => set('riscoFuga', v)} label="Risco de fuga" points="" color="red" />
                  <ToggleCheckbox checked={form.riscoAutoagressao} onChange={(v) => set('riscoAutoagressao', v)} label="Risco de autoagressão" points="" color="red" />
                  <ToggleCheckbox checked={form.riscoQueda} onChange={(v) => set('riscoQueda', v)} label="Risco de queda" points="" color="red" />
                  <ToggleCheckbox checked={form.riscoAgressividade} onChange={(v) => set('riscoAgressividade', v)} label="Risco de agressividade" points="" color="red" />
                  <ToggleCheckbox checked={form.riscoOutro} onChange={(v) => set('riscoOutro', v)} label="Outro" points="" color="red" />
                </div>
              </div>
            </div>
          </SectionCard>

          {/* ── BLOCO 6: ESTRATÉGIAS PREVENTIVAS ── */}
          <SectionCard
            title="6. Estratégias Preventivas"
            icon="🛡️"
            subtitle="Recomendadas pelo acompanhante"
            accentColor="green"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <ToggleCheckbox checked={form.estratReducaoEstimulo} onChange={(v) => set('estratReducaoEstimulo', v)} label="Redução de estímulo sensorial" points="" color="green" />
              <ToggleCheckbox checked={form.estratAmbienteSilencioso} onChange={(v) => set('estratAmbienteSilencioso', v)} label="Ambiente silencioso" points="" color="green" />
              <ToggleCheckbox checked={form.estratReducaoIluminacao} onChange={(v) => set('estratReducaoIluminacao', v)} label="Redução de iluminação" points="" color="green" />
              <ToggleCheckbox checked={form.estratAnticipacaoVerbal} onChange={(v) => set('estratAnticipacaoVerbal', v)} label="Antecipação verbal" points="" color="green" />
              <ToggleCheckbox checked={form.estratCobertor} onChange={(v) => set('estratCobertor', v)} label="Cobertor" points="" color="green" />
              <ToggleCheckbox checked={form.estratAbafador} onChange={(v) => set('estratAbafador', v)} label="Abafador" points="" color="green" />
              <ToggleCheckbox checked={form.estratOculosEscuros} onChange={(v) => set('estratOculosEscuros', v)} label="Óculos escuros" points="" color="green" />
              <ToggleCheckbox checked={form.estratTempoAdaptacao} onChange={(v) => set('estratTempoAdaptacao', v)} label="Tempo maior de adaptação" points="" color="green" />
              <ToggleCheckbox checked={form.estratComunicacaoVisual} onChange={(v) => set('estratComunicacaoVisual', v)} label="Comunicação visual" points="" color="green" />
              <ToggleCheckbox checked={form.estratObjetoConforto} onChange={(v) => set('estratObjetoConforto', v)} label="Uso de objeto de conforto" points="" color="green" />
              <div className="sm:col-span-2">
                <ToggleCheckbox checked={form.estratOutros} onChange={(v) => set('estratOutros', v)} label="Outros" points="" color="green" />
                {form.estratOutros && (
                  <input
                    type="text"
                    className={`${fieldClass} mt-2`}
                    placeholder="Descreva outras estratégias..."
                    value={form.estratOutrosTexto}
                    onChange={(e) => set('estratOutrosTexto', e.target.value)}
                  />
                )}
              </div>
            </div>
          </SectionCard>

          {/* ── BLOCO 7: MEDICAÇÃO DOMICILIAR ── */}
          <SectionCard title="7. Medicação Domiciliar" icon="💊" accentColor="purple">
            <div className="space-y-4">
              <div>
                <p className={sectionLabel}>Uso contínuo DOMICILIAR de MEDICAÇÃO neuropsiquiátrica</p>
                <RadioGroup
                  columns={2}
                  value={form.medicacaoContinua}
                  onChange={(v) => set('medicacaoContinua', v)}
                  options={[
                    { value: 'nao', label: 'Não' },
                    { value: 'sim', label: 'Sim' },
                  ]}
                />
              </div>
              {form.medicacaoContinua === 'sim' && (
                <div>
                  <label className={labelClass}>Qual medicação?</label>
                  <input
                    type="text"
                    className={fieldClass}
                    placeholder="Nome(s) da(s) medicação(ões) domiciliar(es)"
                    value={form.medicacaoQual}
                    onChange={(e) => set('medicacaoQual', e.target.value)}
                  />
                </div>
              )}
            </div>
          </SectionCard>

          {/* ── BLOCO 8: REGISTRO DE INTERVENÇÃO E DESFECHO ── */}
          <SectionCard
            title="8. Registro de Intervenção e Desfecho"
            icon="📝"
            subtitle="Exclusivo da equipe de saúde"
            accentColor="red"
          >
            <div className="space-y-5">
              <div>
                <p className={sectionLabel}>Intervenções Realizadas</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <ToggleCheckbox checked={form.intervManejoAmbiental} onChange={(v) => set('intervManejoAmbiental', v)} label="Manejo ambiental" points="" color="red" />
                  <ToggleCheckbox checked={form.intervReducaoEstimulos} onChange={(v) => set('intervReducaoEstimulos', v)} label="Redução de estímulos" points="" color="red" />
                  <ToggleCheckbox checked={form.intervRealocacao} onChange={(v) => set('intervRealocacao', v)} label="Realocação de ambiente" points="" color="red" />
                  <ToggleCheckbox checked={form.intervPausaRegulatoria} onChange={(v) => set('intervPausaRegulatoria', v)} label="Pausa regulatória" points="" color="red" />
                  <ToggleCheckbox checked={form.intervComunicacaoAntecipatoria} onChange={(v) => set('intervComunicacaoAntecipatoria', v)} label="Comunicação antecipatória estruturada" points="" color="red" />
                  <ToggleCheckbox checked={form.intervContencaoFisica} onChange={(v) => set('intervContencaoFisica', v)} label="Contenção física" points="" color="red" />
                  <div className="sm:col-span-2">
                    <ToggleCheckbox checked={form.intervFarmacologica} onChange={(v) => set('intervFarmacologica', v)} label="Intervenção farmacológica para conter a crise" points="" color="red" />
                    {form.intervFarmacologica && (
                      <input
                        type="text"
                        className={`${fieldClass} mt-2`}
                        placeholder="Qual medicamento foi administrado?"
                        value={form.intervMedicamentoAdministrado}
                        onChange={(e) => set('intervMedicamentoAdministrado', e.target.value)}
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-5">
                <p className={sectionLabel}>Desfecho</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <ToggleCheckbox checked={form.desfechoApenasManejo} onChange={(v) => set('desfechoApenasManejo', v)} label="Apenas Manejo" points="" color="amber" />
                  <ToggleCheckbox checked={form.desfechoCriseEvitada} onChange={(v) => set('desfechoCriseEvitada', v)} label="Crise evitada" points="" color="amber" />
                  <ToggleCheckbox checked={form.desfechoCriseControlada} onChange={(v) => set('desfechoCriseControlada', v)} label="Crise controlada" points="" color="amber" />
                  <ToggleCheckbox checked={form.desfechoCriseContencao} onChange={(v) => set('desfechoCriseContencao', v)} label="Crise controlada com contenção" points="" color="amber" />
                  <ToggleCheckbox checked={form.desfechoAtendimentoConcluido} onChange={(v) => set('desfechoAtendimentoConcluido', v)} label="Atendimento concluído sem escalonamento crítico" points="" color="green" />
                  <ToggleCheckbox checked={form.desfechoFarmacologicaDesfecho} onChange={(v) => set('desfechoFarmacologicaDesfecho', v)} label="Intervenção farmacológica" points="" color="amber" />
                  <ToggleCheckbox checked={form.desfechoEquipeAmpliada} onChange={(v) => set('desfechoEquipeAmpliada', v)} label="Acionamento de equipe ampliada" points="" color="red" />
                </div>
              </div>
            </div>
          </SectionCard>

          {/* ── BLOCO 9: AVALIAÇÃO PÓS-ATENDIMENTO ── */}
          <SectionCard
            title="9. Avaliação Pós-Atendimento"
            icon="⭐"
            subtitle="Escala de 1 (muito ruim) a 5 (excelente)"
            accentColor="blue"
          >
            <div className="space-y-4">
              <ScalePicker value={form.avalClareza} onChange={(v) => set('avalClareza', v)} label="Clareza do protocolo" />
              <div className="border-t border-slate-100" />
              <ScalePicker value={form.avalFacilidade} onChange={(v) => set('avalFacilidade', v)} label="Facilidade de aplicação" />
              <div className="border-t border-slate-100" />
              <ScalePicker value={form.avalImproviso} onChange={(v) => set('avalImproviso', v)} label="Redução de improviso" />
              <div className="border-t border-slate-100" />
              <ScalePicker value={form.avalSeguranca} onChange={(v) => set('avalSeguranca', v)} label="Sensação de segurança da equipe" />
              <div className="border-t border-slate-100" />
              <ScalePicker value={form.avalBeneficio} onChange={(v) => set('avalBeneficio', v)} label="Percepção de benefício ao paciente" />
            </div>
          </SectionCard>

          {/* ── BLOCO 10: TERMO DE CONSENTIMENTO ── */}
          <SectionCard title="10. Termo de Consentimento" icon="📄" accentColor="slate">
            <div className="space-y-5">
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-sm text-slate-700 leading-relaxed space-y-3">
                <p className="font-bold text-slate-800 text-center">
                  TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO – TCLE
                </p>
                <p className="font-semibold text-slate-800">
                  Protocolo GUARDA-CHUVA · PAAR V2 · Santa Casa de Misericórdia de Itu – PSI
                </p>
                <p>
                  O presente termo visa informar e obter o consentimento do paciente ou de seu responsável legal para a
                  aplicação do Protocolo de Avaliação e Atendimento em Risco (PAAR V2), destinado a pacientes
                  neurodivergentes em situação de atendimento hospitalar na Unidade de Saúde acima identificada.
                </p>
                <p>
                  <strong>Objetivo:</strong> A triagem sensorial tem como finalidade identificar hipersensibilidades,
                  sinais de alerta comportamental e nível de desregulação do paciente, a fim de orientar estratégias de
                  manejo seguro, humanizado e preventivo durante o atendimento hospitalar.
                </p>
                <p>
                  <strong>Procedimentos:</strong> Serão coletadas informações sobre o perfil sensorial e comunicativo do
                  paciente, histórico de diagnóstico, medicações em uso e estratégias preventivas indicadas pelo
                  acompanhante. Nenhum procedimento invasivo é realizado nesta etapa.
                </p>
                <p>
                  <strong>Confidencialidade:</strong> As informações coletadas são de uso exclusivo da equipe de saúde
                  responsável pelo atendimento e ficam registradas no prontuário, respeitando a Lei Geral de Proteção de
                  Dados (LGPD – Lei nº 13.709/2018) e o sigilo profissional em saúde.
                </p>
                <p>
                  <strong>Voluntariedade:</strong> A participação é voluntária. O responsável ou o próprio paciente
                  (quando capaz) pode recusar a aplicação do protocolo sem qualquer prejuízo ao atendimento clínico.
                </p>
                <p>
                  <strong>Benefícios esperados:</strong> Redução de crises sensoriais, humanização do atendimento,
                  maior segurança para o paciente e para a equipe, e registro estruturado para continuidade do cuidado.
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Em caso de dúvidas, entre em contato com a equipe responsável do setor PSI da Santa Casa de
                  Misericórdia de Itu.
                </p>
              </div>

              {/* Aceite */}
              <button
                type="button"
                onClick={() => set('termoAceito', !form.termoAceito)}
                className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl border-2 transition-all ${
                  form.termoAceito
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'bg-white border-slate-300 text-slate-700 hover:border-emerald-400'
                }`}
                aria-pressed={form.termoAceito}
              >
                <span
                  className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center ${
                    form.termoAceito ? 'border-white bg-white/30' : 'border-slate-400'
                  }`}
                >
                  {form.termoAceito && (
                    <svg className="w-3 h-3 text-white" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span className="font-semibold text-sm text-left">
                  Li e aceito os termos de consentimento informado acima
                </span>
              </button>

              {/* Assinatura e Data */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Assinatura Digital (Nome completo do responsável)</label>
                  <input
                    type="text"
                    className={fieldClass}
                    placeholder="Nome completo como assinatura"
                    value={form.assinaturaDigital}
                    onChange={(e) => set('assinaturaDigital', e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Data de Assinatura</label>
                  <input
                    type="date"
                    className={fieldClass}
                    value={form.dataAssinatura}
                    onChange={(e) => set('dataAssinatura', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pb-8">
            <button
              type="submit"
              className="flex-1 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white font-bold py-4 px-6 rounded-xl text-sm uppercase tracking-wider transition-colors shadow-md shadow-blue-900/20"
            >
              ✔ Registrar Triagem
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="sm:w-auto bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-700 font-bold py-4 px-6 rounded-xl text-sm uppercase tracking-wider transition-colors"
            >
              ↺ Limpar Formulário
            </button>
          </div>
        </form>
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 text-slate-400 text-center py-4 text-xs mt-4">
        <p>GUARDA-CHUVA · PAAR/PSU Digital · Santa Casa de Misericórdia de Itu – PSI</p>
        <p className="mt-0.5 text-slate-500">Uso exclusivo para profissionais de saúde habilitados · Protocolo PAAR V2</p>
      </footer>
    </div>
  )
}
