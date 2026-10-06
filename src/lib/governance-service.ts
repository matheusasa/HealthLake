// Serviço de Governança de Dados e Catálogo — HealthLake
// Tipos e dados demo para o módulo de Governança

export interface GovernanceColumn {
  name: string;
  type: string;
  description: string;
  isSensitive: boolean;
}

export interface GovernanceTable {
  name: string;
  database: string;
  layer: 'raw' | 'staging' | 'curated';
  columns: GovernanceColumn[];
  owner: string;
  classification: 'pública' | 'interna' | 'confidencial' | 'restrita';
  piiFields: string[];
  lgpdStatus: 'conforme' | 'em_analise' | 'nao_conforme';
  lastUpdated: string; // ISO 8601
}

const DEMO_TABLES: GovernanceTable[] = [
  {
    name: 'pacientes_raw',
    database: 'healthlake_raw',
    layer: 'raw',
    columns: [
      { name: 'id_paciente', type: 'string', description: 'Identificador único do paciente', isSensitive: true },
      { name: 'nome_completo', type: 'string', description: 'Nome completo do paciente', isSensitive: true },
      { name: 'cpf', type: 'string', description: 'CPF do paciente (criptografado)', isSensitive: true },
      { name: 'data_nascimento', type: 'date', description: 'Data de nascimento', isSensitive: true },
      { name: 'sexo', type: 'string', description: 'Sexo biológico', isSensitive: false },
      { name: 'cidade', type: 'string', description: 'Cidade de residência', isSensitive: false },
      { name: 'data_ingresso', type: 'timestamp', description: 'Data de ingresso no sistema', isSensitive: false },
    ],
    owner: 'Equipe de Ingestão de Dados',
    classification: 'restrita',
    piiFields: ['id_paciente', 'nome_completo', 'cpf', 'data_nascimento'],
    lgpdStatus: 'conforme',
    lastUpdated: '2026-10-04T08:30:00Z',
  },
  {
    name: 'consultas_raw',
    database: 'healthlake_raw',
    layer: 'raw',
    columns: [
      { name: 'id_consulta', type: 'string', description: 'Identificador da consulta', isSensitive: false },
      { name: 'id_paciente', type: 'string', description: 'FK para pacientes', isSensitive: true },
      { name: 'id_medico', type: 'string', description: 'FK para médicos', isSensitive: true },
      { name: 'data_consulta', type: 'timestamp', description: 'Data e hora da consulta', isSensitive: false },
      { name: 'cid_principal', type: 'string', description: 'Código CID-10 principal', isSensitive: true },
      { name: 'tipo_consulta', type: 'string', description: 'Tipo: presencial, telemedicina', isSensitive: false },
    ],
    owner: 'Equipe de Ingestão de Dados',
    classification: 'confidencial',
    piiFields: ['id_paciente', 'id_medico', 'cid_principal'],
    lgpdStatus: 'conforme',
    lastUpdated: '2026-10-04T09:15:00Z',
  },
  {
    name: 'medicos_raw',
    database: 'healthlake_raw',
    layer: 'raw',
    columns: [
      { name: 'id_medico', type: 'string', description: 'Identificador do médico', isSensitive: true },
      { name: 'nome', type: 'string', description: 'Nome do médico', isSensitive: true },
      { name: 'crm', type: 'string', description: 'Número CRM', isSensitive: true },
      { name: 'especialidade', type: 'string', description: 'Especialidade médica', isSensitive: false },
      { name: 'unidade_saude', type: 'string', description: 'Unidade de saúde vinculada', isSensitive: false },
    ],
    owner: 'Equipe de Ingestão de Dados',
    classification: 'confidencial',
    piiFields: ['id_medico', 'nome', 'crm'],
    lgpdStatus: 'em_analise',
    lastUpdated: '2026-10-03T14:00:00Z',
  },
  {
    name: 'pacientes_staging',
    database: 'healthlake_staging',
    layer: 'staging',
    columns: [
      { name: 'id_paciente_hash', type: 'string', description: 'Hash do ID do paciente (anonimizado)', isSensitive: false },
      { name: 'faixa_etaria', type: 'string', description: 'Faixa etária agrupada', isSensitive: false },
      { name: 'sexo', type: 'string', description: 'Sexo biológico', isSensitive: false },
      { name: 'regiao_saude', type: 'string', description: 'Região de saúde', isSensitive: false },
      { name: 'indicador_cronico', type: 'boolean', description: 'Indicador de doença crônica', isSensitive: true },
    ],
    owner: 'Equipe de Transformação',
    classification: 'interna',
    piiFields: ['indicador_cronico'],
    lgpdStatus: 'conforme',
    lastUpdated: '2026-10-04T10:45:00Z',
  },
  {
    name: 'consultas_staging',
    database: 'healthlake_staging',
    layer: 'staging',
    columns: [
      { name: 'id_consulta', type: 'string', description: 'Identificador da consulta', isSensitive: false },
      { name: 'id_paciente_hash', type: 'string', description: 'Hash do paciente', isSensitive: false },
      { name: 'mes_referencia', type: 'string', description: 'Mês de referência YYYY-MM', isSensitive: false },
      { name: 'cid_grupo', type: 'string', description: 'Grupo CID agregado', isSensitive: false },
      { name: 'custo_estimado', type: 'decimal', description: 'Custo estimado da consulta', isSensitive: false },
    ],
    owner: 'Equipe de Transformação',
    classification: 'interna',
    piiFields: [],
    lgpdStatus: 'conforme',
    lastUpdated: '2026-10-04T11:00:00Z',
  },
  {
    name: 'indicadores_saude_curated',
    database: 'healthlake_curated',
    layer: 'curated',
    columns: [
      { name: 'mes_referencia', type: 'string', description: 'Mês de referência', isSensitive: false },
      { name: 'regiao_saude', type: 'string', description: 'Região de saúde', isSensitive: false },
      { name: 'total_consultas', type: 'bigint', description: 'Total de consultas no período', isSensitive: false },
      { name: 'taxa_internacao', type: 'decimal', description: 'Taxa de internação (%)', isSensitive: false },
      { name: 'custo_medio_consulta', type: 'decimal', description: 'Custo médio por consulta', isSensitive: false },
      { name: 'indice_satisfacao', type: 'decimal', description: 'Índice de satisfação do paciente', isSensitive: false },
    ],
    owner: 'Equipe de Analytics',
    classification: 'interna',
    piiFields: [],
    lgpdStatus: 'conforme',
    lastUpdated: '2026-10-05T06:00:00Z',
  },
  {
    name: 'dashboard_executivo_curated',
    database: 'healthlake_curated',
    layer: 'curated',
    columns: [
      { name: 'data_snapshot', type: 'date', description: 'Data do snapshot', isSensitive: false },
      { name: 'kpi_ocupacao_leitos', type: 'decimal', description: 'KPI ocupação de leitos (%)', isSensitive: false },
      { name: 'kpi_tempo_espera', type: 'decimal', description: 'Tempo médio de espera (min)', isSensitive: false },
      { name: 'kpi_readmissao_30d', type: 'decimal', description: 'Taxa de readmissão em 30 dias (%)', isSensitive: false },
      { name: 'regiao', type: 'string', description: 'Região agregada', isSensitive: false },
    ],
    owner: 'Equipe de Analytics',
    classification: 'pública',
    piiFields: [],
    lgpdStatus: 'conforme',
    lastUpdated: '2026-10-05T07:30:00Z',
  },
  {
    name: 'lgpd_auditoria_curated',
    database: 'healthlake_curated',
    layer: 'curated',
    columns: [
      { name: 'id_registro', type: 'string', description: 'ID do registro de auditoria', isSensitive: false },
      { name: 'tabela_acessada', type: 'string', description: 'Nome da tabela acessada', isSensitive: false },
      { name: 'usuario_acesso', type: 'string', description: 'Usuário que acessou (hash)', isSensitive: true },
      { name: 'data_acesso', type: 'timestamp', description: 'Data/hora do acesso', isSensitive: false },
      { name: 'finalidade', type: 'string', description: 'Finalidade do acesso', isSensitive: false },
      { name: 'base_legal', type: 'string', description: 'Base legal LGPD', isSensitive: false },
    ],
    owner: 'DPO / Compliance',
    classification: 'restrita',
    piiFields: ['usuario_acesso'],
    lgpdStatus: 'nao_conforme',
    lastUpdated: '2026-10-02T16:20:00Z',
  },
];

export async function getGovernanceCatalog(): Promise<GovernanceTable[]> {
  // Em produção, aqui seria a chamada ao AWS Glue Data Catalog
  // Por enquanto, retorna dados demo realistas
  return DEMO_TABLES;
}