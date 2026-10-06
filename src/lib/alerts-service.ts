// Serviço de Alertas e Notificações do HealthLake

export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface Alert {
  id: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  source: string;
  timestamp: string; // ISO 8601
  acknowledged: boolean;
  channel: string;
}

export interface NotificationChannel {
  id: string;
  name: string;
  type: 'sns' | 'slack' | 'teams';
  enabled: boolean;
  target: string;
}

const DEMO_ALERTS: Alert[] = [
  {
    id: 'ALT-001',
    severity: 'critical',
    title: 'SLA violado: dataset de pacientes',
    description: 'O dataset raw/patients não é atualizado há 26 horas. SLA definido: 12h. Pipeline etl-patient-ingest falhou na última execução.',
    source: 'Atualização de Dados',
    timestamp: '2026-10-06T08:15:00Z',
    acknowledged: false,
    channel: 'sns',
  },
  {
    id: 'ALT-002',
    severity: 'critical',
    title: 'Falha no job ETL: etl-lab-results',
    description: 'Job Glue etl-lab-results falhou com erro OutOfMemoryError. Últimas 3 tentativas consecutivas sem sucesso. Dados de exames atrasados.',
    source: 'Jobs ETL',
    timestamp: '2026-10-06T07:42:00Z',
    acknowledged: false,
    channel: 'slack',
  },
  {
    id: 'ALT-003',
    severity: 'warning',
    title: 'Qualidade: nulidade acima do limite em prescriptions',
    description: 'Regra null_check_prescriptions detectou 8,3% de valores nulos no campo dosage. Limite aceitável: 5%. Dataset: curated/prescriptions.',
    source: 'Qualidade de Dados',
    timestamp: '2026-10-06T06:30:00Z',
    acknowledged: true,
    channel: 'slack',
  },
  {
    id: 'ALT-004',
    severity: 'warning',
    title: 'Anomalia de custo: Athena scan acima da média',
    description: 'Consulta analítica no dataset claims executou scan de 4,2 TB, 3x acima da média diária. Custo estimado: $189. Verificar partição e filtros.',
    source: 'FinOps & Custos',
    timestamp: '2026-10-06T05:10:00Z',
    acknowledged: false,
    channel: 'teams',
  },
  {
    id: 'ALT-005',
    severity: 'critical',
    title: 'Armazenamento: camada raw atingiu 92% da cota',
    description: 'Camada raw do datalake utiliza 46,1 TB de 50 TB provisionados. Crescimento projetado esgota capacidade em 8 dias se nenhuma ação for tomada.',
    source: 'Armazenamento',
    timestamp: '2026-10-06T04:00:00Z',
    acknowledged: false,
    channel: 'sns',
  },
  {
    id: 'ALT-006',
    severity: 'info',
    title: 'Manutenção programada: AWS Glue patching',
    description: 'Janela de manutenção AWS Glue agendada para 2026-10-07 02:00-04:00 UTC. Jobs podem ter latência aumentada durante o período.',
    source: 'Jobs ETL',
    timestamp: '2026-10-05T22:00:00Z',
    acknowledged: true,
    channel: 'teams',
  },
  {
    id: 'ALT-007',
    severity: 'warning',
    title: 'Duplicidade detectada: tabela encounters',
    description: 'Regra dedup_check_encounters identificou 1.247 registros duplicados nas últimas 24h. Taxa de duplicidade: 2,1%. Limite: 1%.',
    source: 'Qualidade de Dados',
    timestamp: '2026-10-05T18:45:00Z',
    acknowledged: true,
    channel: 'slack',
  },
  {
    id: 'ALT-008',
    severity: 'info',
    title: 'Novo dataset onboarded: imaging_reports',
    description: 'Dataset raw/imaging_reports foi registrado no catálogo de dados com 340 GB iniciais. Pipeline de qualidade configurado e ativo.',
    source: 'Atualização de Dados',
    timestamp: '2026-10-05T14:20:00Z',
    acknowledged: true,
    channel: 'teams',
  },
  {
    id: 'ALT-009',
    severity: 'warning',
    title: 'Orçamento FinOps: 78% utilizado no mês',
    description: 'Gasto acumulado em outubro atingiu $12.480 de $16.000 orçados. Projeção mensal: $15.200. Dentro do limite mas próximo do threshold de alerta.',
    source: 'FinOps & Custos',
    timestamp: '2026-10-05T10:00:00Z',
    acknowledged: false,
    channel: 'sns',
  },
  {
    id: 'ALT-010',
    severity: 'critical',
    title: 'Schema drift: tabela lab_results alterada',
    description: 'Coluna result_value_type foi removida do schema da tabela curated/lab_results. Downstream queries podem falhar. Verificar dependências.',
    source: 'Qualidade de Dados',
    timestamp: '2026-10-05T03:15:00Z',
    acknowledged: false,
    channel: 'slack',
  },
];

const DEMO_CHANNELS: NotificationChannel[] = [
  {
    id: 'CH-001',
    name: 'Equipe de Dados (Slack)',
    type: 'slack',
    enabled: true,
    target: '#datalake-alerts',
  },
  {
    id: 'CH-002',
    name: 'On-Call SRE (SNS)',
    type: 'sns',
    enabled: true,
    target: 'arn:aws:sns:us-east-1:123456789:datalake-critical',
  },
  {
    id: 'CH-003',
    name: 'Gestão de Saúde (Teams)',
    type: 'teams',
    enabled: false,
    target: 'healthlake-managers@org.com',
  },
];

export async function getAlerts(): Promise<{ alerts: Alert[]; channels: NotificationChannel[] }> {
  // Em produção, buscaria do CloudWatch Alarms / SNS / DynamoDB
  // Por agora retorna dados demo realistas
  return {
    alerts: DEMO_ALERTS,
    channels: DEMO_CHANNELS,
  };
}