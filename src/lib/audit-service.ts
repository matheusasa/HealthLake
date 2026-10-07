// Serviço de Auditoria e Logs do HealthLake

export type AuditSeverity = 'info' | 'warning' | 'critical';
export type AuditSource = 'athena' | 'glue' | 's3' | 'iam' | 'lakeformation';
export type AuditAction =
  | 'query'
  | 'access_denied'
  | 'data_export'
  | 'schema_change'
  | 'permission_change'
  | 'login_failure'
  | 'role_assumed';

export interface AuditEvent {
  id: string;
  timestamp: string; // ISO 8601
  userId: string;
  userName: string;
  action: AuditAction;
  resource: string;
  source: AuditSource;
  severity: AuditSeverity;
  details: string;
  ipAddress: string;
  isAnomaly: boolean;
  anomalyReason?: string;
}

export interface UserActivitySummary {
  userId: string;
  userName: string;
  totalEvents: number;
  criticalCount: number;
  anomalyCount: number;
  lastActivity: string;
}

export interface AuditAnalytics {
  events: AuditEvent[];
  userSummaries: UserActivitySummary[];
  summary: {
    totalEvents24h: number;
    criticalEvents24h: number;
    anomaliesDetected: number;
    uniqueUsersActive: number;
    accessDeniedCount: number;
  };
}

const DEMO_EVENTS: AuditEvent[] = [
  // --- u-008 Henrique Costa (Externo Parceiro) — anomalias críticas ---
  {
    id: 'AUD-001',
    timestamp: '2026-10-06T09:12:00Z',
    userId: 'u-008',
    userName: 'Henrique Costa',
    action: 'access_denied',
    resource: 'curated.patients',
    source: 'lakeformation',
    severity: 'critical',
    details: 'Acesso negado à tabela PII curated.patients. Usuário externo sem permissão para dados sensíveis.',
    ipAddress: '203.0.113.42',
    isAnomaly: true,
    anomalyReason: 'Tabela PII fora do escopo do parceiro',
  },
  {
    id: 'AUD-002',
    timestamp: '2026-10-06T09:08:00Z',
    userId: 'u-008',
    userName: 'Henrique Costa',
    action: 'login_failure',
    resource: 'iam:console',
    source: 'iam',
    severity: 'critical',
    details: 'Falha de login a partir de IP não reconhecido. Terceira tentativa consecutiva em 5 minutos.',
    ipAddress: '198.51.100.77',
    isAnomaly: true,
    anomalyReason: 'Múltiplas falhas de login de IP incomum',
  },
  {
    id: 'AUD-003',
    timestamp: '2026-10-06T09:05:00Z',
    userId: 'u-008',
    userName: 'Henrique Costa',
    action: 'login_failure',
    resource: 'iam:console',
    source: 'iam',
    severity: 'critical',
    details: 'Falha de login a partir de IP não reconhecido. Segunda tentativa consecutiva.',
    ipAddress: '198.51.100.77',
    isAnomaly: true,
    anomalyReason: 'Múltiplas falhas de login de IP incomum',
  },
  {
    id: 'AUD-004',
    timestamp: '2026-10-06T09:01:00Z',
    userId: 'u-008',
    userName: 'Henrique Costa',
    action: 'login_failure',
    resource: 'iam:console',
    source: 'iam',
    severity: 'warning',
    details: 'Primeira falha de login registrada para este usuário no período.',
    ipAddress: '198.51.100.77',
    isAnomaly: false,
  },

  // --- u-004 Diego Ferreira (Analytics) — query fora de horário ---
  {
    id: 'AUD-005',
    timestamp: '2026-10-05T03:14:00Z',
    userId: 'u-004',
    userName: 'Diego Ferreira',
    action: 'query',
    resource: 'curated.claims',
    source: 'athena',
    severity: 'warning',
    details: 'Consulta analítica executada às 03:14 de sábado. Volume de scan: 2,8 TB.',
    ipAddress: '10.0.12.55',
    isAnomaly: true,
    anomalyReason: 'Fora do horário habitual de trabalho',
  },
  {
    id: 'AUD-006',
    timestamp: '2026-10-06T10:30:00Z',
    userId: 'u-004',
    userName: 'Diego Ferreira',
    action: 'query',
    resource: 'curated.encounters',
    source: 'athena',
    severity: 'info',
    details: 'Consulta rotineira de análise de internações. Scan: 340 GB.',
    ipAddress: '10.0.12.55',
    isAnomaly: false,
  },

  // --- u-003 Carla Mendes (Equipe Clínica) — access_denied múltiplos ---
  {
    id: 'AUD-007',
    timestamp: '2026-10-06T08:45:00Z',
    userId: 'u-003',
    userName: 'Carla Mendes',
    action: 'access_denied',
    resource: 'raw.genomics',
    source: 'lakeformation',
    severity: 'warning',
    details: 'Acesso negado ao dataset raw.genomics. Usuário clínico sem permissão para camada raw.',
    ipAddress: '10.0.10.22',
    isAnomaly: true,
    anomalyReason: 'Múltiplas tentativas de acesso negado ao mesmo recurso',
  },
  {
    id: 'AUD-008',
    timestamp: '2026-10-06T08:42:00Z',
    userId: 'u-003',
    userName: 'Carla Mendes',
    action: 'access_denied',
    resource: 'raw.genomics',
    source: 'lakeformation',
    severity: 'warning',
    details: 'Segunda tentativa de acesso ao dataset raw.genomics negada.',
    ipAddress: '10.0.10.22',
    isAnomaly: true,
    anomalyReason: 'Múltiplas tentativas de acesso negado ao mesmo recurso',
  },
  {
    id: 'AUD-009',
    timestamp: '2026-10-06T08:38:00Z',
    userId: 'u-003',
    userName: 'Carla Mendes',
    action: 'access_denied',
    resource: 'raw.genomics',
    source: 'lakeformation',
    severity: 'warning',
    details: 'Primeira tentativa de acesso ao dataset raw.genomics negada.',
    ipAddress: '10.0.10.22',
    isAnomaly: false,
  },

  // --- u-001 Ana Souza (Equipe Clínica) — operações normais ---
  {
    id: 'AUD-010',
    timestamp: '2026-10-06T11:20:00Z',
    userId: 'u-001',
    userName: 'Ana Souza',
    action: 'query',
    resource: 'curated.patients',
    source: 'athena',
    severity: 'info',
    details: 'Consulta clínica rotineira na tabela de pacientes. Scan: 120 GB.',
    ipAddress: '10.0.10.15',
    isAnomaly: false,
  },
  {
    id: 'AUD-011',
    timestamp: '2026-10-06T09:55:00Z',
    userId: 'u-001',
    userName: 'Ana Souza',
    action: 'data_export',
    resource: 'curated.prescriptions',
    source: 's3',
    severity: 'info',
    details: 'Exportação de relatório de prescrições para análise clínica.',
    ipAddress: '10.0.10.15',
    isAnomaly: false,
  },

  // --- u-002 Bruno Lima (Engenharia de Dados) ---
  {
    id: 'AUD-012',
    timestamp: '2026-10-06T07:30:00Z',
    userId: 'u-002',
    userName: 'Bruno Lima',
    action: 'schema_change',
    resource: 'staging.lab_results',
    source: 'glue',
    severity: 'warning',
    details: 'Alteração de schema na tabela staging.lab_results: nova coluna test_reference_range adicionada.',
    ipAddress: '10.0.11.30',
    isAnomaly: false,
  },
  {
    id: 'AUD-013',
    timestamp: '2026-10-06T06:15:00Z',
    userId: 'u-002',
    userName: 'Bruno Lima',
    action: 'role_assumed',
    resource: 'arn:aws:iam::role/GlueETLRole',
    source: 'iam',
    severity: 'info',
    details: 'Assunção de role GlueETLRole para execução de pipeline ETL noturno.',
    ipAddress: '10.0.11.30',
    isAnomaly: false,
  },

  // --- u-005 Elena Rossi (Compliance) ---
  {
    id: 'AUD-014',
    timestamp: '2026-10-06T10:00:00Z',
    userId: 'u-005',
    userName: 'Elena Rossi',
    action: 'permission_change',
    resource: 'lf:database:curated',
    source: 'lakeformation',
    severity: 'info',
    details: 'Permissão SELECT concedida ao grupo Analytics na base curated.',
    ipAddress: '10.0.13.10',
    isAnomaly: false,
  },
  {
    id: 'AUD-015',
    timestamp: '2026-10-06T08:20:00Z',
    userId: 'u-005',
    userName: 'Elena Rossi',
    action: 'query',
    resource: 'curated.audit_trail',
    source: 'athena',
    severity: 'info',
    details: 'Consulta de auditoria interna para revisão mensal de compliance.',
    ipAddress: '10.0.13.10',
    isAnomaly: false,
  },

  // --- u-006 Fabio Santos (Engenharia de Dados) ---
  {
    id: 'AUD-016',
    timestamp: '2026-10-06T05:45:00Z',
    userId: 'u-006',
    userName: 'Fabio Santos',
    action: 'data_export',
    resource: 's3://healthlake-raw/imaging/',
    source: 's3',
    severity: 'info',
    details: 'Backup incremental da camada raw/imaging exportado para bucket de DR.',
    ipAddress: '10.0.11.45',
    isAnomaly: false,
  },

  // --- u-007 Gabriela Oliveira (Analytics) ---
  {
    id: 'AUD-017',
    timestamp: '2026-10-06T11:05:00Z',
    userId: 'u-007',
    userName: 'Gabriela Oliveira',
    action: 'query',
    resource: 'curated.claims',
    source: 'athena',
    severity: 'info',
    details: 'Consulta analítica de sinistros para dashboard mensal. Scan: 890 GB.',
    ipAddress: '10.0.12.60',
    isAnomaly: false,
  },
  {
    id: 'AUD-018',
    timestamp: '2026-10-06T09:30:00Z',
    userId: 'u-007',
    userName: 'Gabriela Oliveira',
    action: 'query',
    resource: 'curated.encounters',
    source: 'athena',
    severity: 'info',
    details: 'Análise ad-hoc de tempo médio de internação por especialidade.',
    ipAddress: '10.0.12.60',
    isAnomaly: false,
  },

  // --- Eventos adicionais para completar ~20 ---
  {
    id: 'AUD-019',
    timestamp: '2026-10-05T14:10:00Z',
    userId: 'u-002',
    userName: 'Bruno Lima',
    action: 'schema_change',
    resource: 'raw.vitals',
    source: 'glue',
    severity: 'info',
    details: 'Atualização de crawler no dataset raw/vitals. Nenhuma alteração de schema detectada.',
    ipAddress: '10.0.11.30',
    isAnomaly: false,
  },
  {
    id: 'AUD-020',
    timestamp: '2026-10-05T16:50:00Z',
    userId: 'u-005',
    userName: 'Elena Rossi',
    action: 'permission_change',
    resource: 'lf:table:raw.genomics',
    source: 'lakeformation',
    severity: 'warning',
    details: 'Permissão revogada do grupo Equipe Clínica na tabela raw.genomics após incidente de acesso.',
    ipAddress: '10.0.13.10',
    isAnomaly: false,
  },
];

const DEMO_USER_SUMMARIES: UserActivitySummary[] = [
  {
    userId: 'u-001',
    userName: 'Ana Souza',
    totalEvents: 2,
    criticalCount: 0,
    anomalyCount: 0,
    lastActivity: '2026-10-06T11:20:00Z',
  },
  {
    userId: 'u-002',
    userName: 'Bruno Lima',
    totalEvents: 3,
    criticalCount: 0,
    anomalyCount: 0,
    lastActivity: '2026-10-06T07:30:00Z',
  },
  {
    userId: 'u-003',
    userName: 'Carla Mendes',
    totalEvents: 3,
    criticalCount: 0,
    anomalyCount: 2,
    lastActivity: '2026-10-06T08:45:00Z',
  },
  {
    userId: 'u-004',
    userName: 'Diego Ferreira',
    totalEvents: 2,
    criticalCount: 0,
    anomalyCount: 1,
    lastActivity: '2026-10-06T10:30:00Z',
  },
  {
    userId: 'u-005',
    userName: 'Elena Rossi',
    totalEvents: 3,
    criticalCount: 0,
    anomalyCount: 0,
    lastActivity: '2026-10-06T10:00:00Z',
  },
  {
    userId: 'u-006',
    userName: 'Fabio Santos',
    totalEvents: 1,
    criticalCount: 0,
    anomalyCount: 0,
    lastActivity: '2026-10-06T05:45:00Z',
  },
  {
    userId: 'u-007',
    userName: 'Gabriela Oliveira',
    totalEvents: 2,
    criticalCount: 0,
    anomalyCount: 0,
    lastActivity: '2026-10-06T11:05:00Z',
  },
  {
    userId: 'u-008',
    userName: 'Henrique Costa',
    totalEvents: 4,
    criticalCount: 3,
    anomalyCount: 3,
    lastActivity: '2026-10-06T09:12:00Z',
  },
];

export async function getAuditData(): Promise<AuditAnalytics> {
  return {
    events: DEMO_EVENTS,
    userSummaries: DEMO_USER_SUMMARIES,
    summary: {
      totalEvents24h: DEMO_EVENTS.length,
      criticalEvents24h: DEMO_EVENTS.filter((e) => e.severity === 'critical').length,
      anomaliesDetected: DEMO_EVENTS.filter((e) => e.isAnomaly).length,
      uniqueUsersActive: new Set(DEMO_EVENTS.map((e) => e.userId)).size,
      accessDeniedCount: DEMO_EVENTS.filter((e) => e.action === 'access_denied').length,
    },
  };
}