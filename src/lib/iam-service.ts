// Serviço de IAM (Identity & Access Management) — HealthLake
// Tipos e dados demo para o módulo de IAM

export type IamEntityType = 'user' | 'group' | 'role' | 'service_key';
export type DataLayer = 'raw' | 'staging' | 'curated';
export type PermissionLevel = 'read' | 'write' | 'admin' | 'none';

export interface IamPermission {
  resource: string;
  layer: DataLayer;
  level: PermissionLevel;
}

export interface IamUser {
  id: string;
  name: string;
  email: string;
  groups: string[];
  roles: string[];
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
  mfaEnabled: boolean;
  serviceKeysCount: number;
}

export interface IamGroup {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  permissions: IamPermission[];
  dataLayers: DataLayer[];
}

export interface IamRole {
  id: string;
  name: string;
  description: string;
  trustPolicy: string;
  permissions: IamPermission[];
  maxSessionDuration: number;
}

export interface ServiceKey {
  id: string;
  name: string;
  ownerId: string;
  created: string;
  lastUsed: string;
  status: 'active' | 'rotated' | 'revoked';
}

export interface IamData {
  users: IamUser[];
  groups: IamGroup[];
  roles: IamRole[];
  serviceKeys: ServiceKey[];
  summary: {
    totalUsers: number;
    activeUsers: number;
    totalGroups: number;
    totalRoles: number;
    activeServiceKeys: number;
    usersWithoutMfa: number;
  };
}

const DEMO_USERS: IamUser[] = [
  {
    id: 'u-001',
    name: 'Ana Souza',
    email: 'ana.souza@healthlake.br',
    groups: ['Equipe Clínica'],
    roles: ['DataSteward'],
    status: 'active',
    lastLogin: '2026-10-06T08:15:00Z',
    mfaEnabled: true,
    serviceKeysCount: 0,
  },
  {
    id: 'u-002',
    name: 'Bruno Lima',
    email: 'bruno.lima@healthlake.br',
    groups: ['Engenharia de Dados'],
    roles: ['GlueETLRunner'],
    status: 'active',
    lastLogin: '2026-10-06T09:30:00Z',
    mfaEnabled: true,
    serviceKeysCount: 1,
  },
  {
    id: 'u-003',
    name: 'Carla Mendes',
    email: 'carla.mendes@healthlake.br',
    groups: ['Equipe Clínica'],
    roles: ['AthenaAnalyst'],
    status: 'active',
    lastLogin: '2026-10-05T14:20:00Z',
    mfaEnabled: false,
    serviceKeysCount: 0,
  },
  {
    id: 'u-004',
    name: 'Diego Ferreira',
    email: 'diego.ferreira@healthlake.br',
    groups: ['Analytics'],
    roles: ['AthenaAnalyst'],
    status: 'active',
    lastLogin: '2026-10-06T07:45:00Z',
    mfaEnabled: true,
    serviceKeysCount: 1,
  },
  {
    id: 'u-005',
    name: 'Elena Rossi',
    email: 'elena.rossi@healthlake.br',
    groups: ['Compliance'],
    roles: ['DataSteward'],
    status: 'active',
    lastLogin: '2026-10-04T16:00:00Z',
    mfaEnabled: true,
    serviceKeysCount: 0,
  },
  {
    id: 'u-006',
    name: 'Fabio Santos',
    email: 'fabio.santos@healthlake.br',
    groups: ['Engenharia de Dados'],
    roles: ['GlueETLRunner'],
    status: 'active',
    lastLogin: '2026-10-06T10:00:00Z',
    mfaEnabled: true,
    serviceKeysCount: 1,
  },
  {
    id: 'u-007',
    name: 'Gabriela Oliveira',
    email: 'gabriela.oliveira@healthlake.br',
    groups: ['Analytics'],
    roles: ['AthenaAnalyst'],
    status: 'active',
    lastLogin: '2026-10-05T11:30:00Z',
    mfaEnabled: false,
    serviceKeysCount: 0,
  },
  {
    id: 'u-008',
    name: 'Henrique Costa',
    email: 'henrique.costa@healthlake.br',
    groups: ['Externo (Parceiro)'],
    roles: ['ExternalPartner'],
    status: 'active',
    lastLogin: '2026-10-03T09:00:00Z',
    mfaEnabled: false,
    serviceKeysCount: 1,
  },
];

const DEMO_GROUPS: IamGroup[] = [
  {
    id: 'g-001',
    name: 'Equipe Clínica',
    description: 'Profissionais de saúde com acesso a dados clínicos em staging e curated',
    memberCount: 2,
    permissions: [
      { resource: 'pacientes', layer: 'staging', level: 'read' },
      { resource: 'consultas', layer: 'staging', level: 'read' },
      { resource: 'indicadores_saude', layer: 'curated', level: 'read' },
    ],
    dataLayers: ['staging', 'curated'],
  },
  {
    id: 'g-002',
    name: 'Engenharia de Dados',
    description: 'Equipe responsável por pipelines ETL e ingestão de dados',
    memberCount: 2,
    permissions: [
      { resource: '*', layer: 'raw', level: 'write' },
      { resource: '*', layer: 'staging', level: 'write' },
      { resource: '*', layer: 'curated', level: 'read' },
    ],
    dataLayers: ['raw', 'staging', 'curated'],
  },
  {
    id: 'g-003',
    name: 'Analytics',
    description: 'Analistas de dados com acesso a camadas staging e curated',
    memberCount: 2,
    permissions: [
      { resource: '*', layer: 'staging', level: 'read' },
      { resource: '*', layer: 'curated', level: 'read' },
    ],
    dataLayers: ['staging', 'curated'],
  },
  {
    id: 'g-004',
    name: 'Compliance',
    description: 'Equipe de conformidade LGPD e auditoria de acessos',
    memberCount: 1,
    permissions: [
      { resource: 'lgpd_auditoria', layer: 'curated', level: 'admin' },
      { resource: '*', layer: 'raw', level: 'read' },
      { resource: '*', layer: 'staging', level: 'read' },
      { resource: '*', layer: 'curated', level: 'read' },
    ],
    dataLayers: ['raw', 'staging', 'curated'],
  },
  {
    id: 'g-005',
    name: 'Externo (Parceiro)',
    description: 'Parceiros externos com acesso restrito apenas a dados curated sem PII',
    memberCount: 1,
    permissions: [
      { resource: 'dashboard_executivo', layer: 'curated', level: 'read' },
      { resource: 'indicadores_saude', layer: 'curated', level: 'read' },
    ],
    dataLayers: ['curated'],
  },
];

const DEMO_ROLES: IamRole[] = [
  {
    id: 'r-001',
    name: 'AthenaAnalyst',
    description: 'Permite consultas SQL via Amazon Athena em tabelas staging e curated',
    trustPolicy: 'arn:aws:iam::role/AthenaAnalystTrustPolicy',
    permissions: [
      { resource: 'athena:*', layer: 'staging', level: 'read' },
      { resource: 'athena:*', layer: 'curated', level: 'read' },
      { resource: 's3://healthlake-staging/*', layer: 'staging', level: 'read' },
      { resource: 's3://healthlake-curated/*', layer: 'curated', level: 'read' },
    ],
    maxSessionDuration: 3600,
  },
  {
    id: 'r-002',
    name: 'GlueETLRunner',
    description: 'Permite execução de jobs ETL no AWS Glue com acesso a todas as camadas',
    trustPolicy: 'arn:aws:iam::role/GlueETLTrustPolicy',
    permissions: [
      { resource: 'glue:*', layer: 'raw', level: 'write' },
      { resource: 'glue:*', layer: 'staging', level: 'write' },
      { resource: 's3://healthlake-*', layer: 'raw', level: 'write' },
      { resource: 's3://healthlake-*', layer: 'staging', level: 'write' },
    ],
    maxSessionDuration: 7200,
  },
  {
    id: 'r-003',
    name: 'DataSteward',
    description: 'Responsável pela governança e classificação de dados sensíveis',
    trustPolicy: 'arn:aws:iam::role/DataStewardTrustPolicy',
    permissions: [
      { resource: 'glue:catalog', layer: 'raw', level: 'admin' },
      { resource: 'glue:catalog', layer: 'staging', level: 'admin' },
      { resource: 'glue:catalog', layer: 'curated', level: 'admin' },
    ],
    maxSessionDuration: 3600,
  },
  {
    id: 'r-004',
    name: 'ExternalPartner',
    description: 'Acesso limitado a dados aggregated na camada curated, sem PII',
    trustPolicy: 'arn:aws:iam::role/ExternalPartnerTrustPolicy',
    permissions: [
      { resource: 's3://healthlake-curated/dashboard_*', layer: 'curated', level: 'read' },
      { resource: 'athena:dashboard_queries', layer: 'curated', level: 'read' },
    ],
    maxSessionDuration: 1800,
  },
];

const DEMO_SERVICE_KEYS: ServiceKey[] = [
  {
    id: 'sk-001',
    name: 'pipeline-ingestao-producao',
    ownerId: 'u-002',
    created: '2026-08-15T10:00:00Z',
    lastUsed: '2026-10-06T09:30:00Z',
    status: 'active',
  },
  {
    id: 'sk-002',
    name: 'etl-glue-diario',
    ownerId: 'u-006',
    created: '2026-06-01T08:00:00Z',
    lastUsed: '2026-10-06T06:00:00Z',
    status: 'active',
  },
  {
    id: 'sk-003',
    name: 'analytics-athena-api',
    ownerId: 'u-004',
    created: '2026-04-10T14:00:00Z',
    lastUsed: '2026-10-05T18:00:00Z',
    status: 'rotated',
  },
  {
    id: 'sk-004',
    name: 'parceiro-externo-acesso',
    ownerId: 'u-008',
    created: '2026-03-01T12:00:00Z',
    lastUsed: '2026-09-15T10:00:00Z',
    status: 'active',
  },
];

const DEMO_IAM_DATA: IamData = {
  users: DEMO_USERS,
  groups: DEMO_GROUPS,
  roles: DEMO_ROLES,
  serviceKeys: DEMO_SERVICE_KEYS,
  summary: {
    totalUsers: DEMO_USERS.length,
    activeUsers: DEMO_USERS.filter((u) => u.status === 'active').length,
    totalGroups: DEMO_GROUPS.length,
    totalRoles: DEMO_ROLES.length,
    activeServiceKeys: DEMO_SERVICE_KEYS.filter((k) => k.status === 'active').length,
    usersWithoutMfa: DEMO_USERS.filter((u) => !u.mfaEnabled).length,
  },
};

export async function getIamData(): Promise<IamData> {
  // Em produção, aqui seriam chamadas ao AWS IAM / Identity Center
  // Por enquanto, retorna dados demo realistas
  return DEMO_IAM_DATA;
}