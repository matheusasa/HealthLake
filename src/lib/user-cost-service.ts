// Serviço de Custos por Usuário do HealthLake
// outlog - tentar logs de tenets diferentes - auditoria / iam - papeis, grupos, services Keys / finops - entender consumers de usuários

export interface UserCostEntry {
  userId: string;
  userName: string;
  groupName: string;
  athenaCostUSD: number;
  s3CostUSD: number;
  glueCostUSD: number;
  totalCostUSD: number;
  queryCount: number;
  bytesScanned: number;
  costPerQuery: number;
  isAnomaly: boolean;
  anomalyReason?: string;
}

export interface DailyUserCost {
  date: string; // YYYY-MM-DD
  userId: string;
  userName: string;
  cost: number;
}

export interface GroupCostSummary {
  groupId: string;
  groupName: string;
  memberCount: number;
  totalCostUSD: number;
  avgCostPerUser: number;
  topSpenderId: string;
  topSpenderName: string;
}

export interface UserCostAnalytics {
  userCosts: UserCostEntry[];
  dailyTrends: DailyUserCost[];
  groupSummaries: GroupCostSummary[];
  summary: {
    totalCost30d: number;
    totalQueries30d: number;
    avgCostPerUser: number;
    usersAboveThreshold: number;
    costliestGroupId: string;
    costliestGroupName: string;
  };
}

const DEMO_USER_COSTS: UserCostEntry[] = [
  {
    userId: 'u-001',
    userName: 'Ana Souza',
    groupName: 'Equipe Clínica',
    athenaCostUSD: 42.3,
    s3CostUSD: 18.5,
    glueCostUSD: 12.1,
    totalCostUSD: 72.9,
    queryCount: 312,
    bytesScanned: 1_840_000_000_000,
    costPerQuery: 0.14,
    isAnomaly: false,
  },
  {
    userId: 'u-002',
    userName: 'Bruno Lima',
    groupName: 'Engenharia de Dados',
    athenaCostUSD: 15.8,
    s3CostUSD: 34.2,
    glueCostUSD: 98.6,
    totalCostUSD: 148.6,
    queryCount: 87,
    bytesScanned: 920_000_000_000,
    costPerQuery: 0.18,
    isAnomaly: false,
  },
  {
    userId: 'u-003',
    userName: 'Carla Mendes',
    groupName: 'Equipe Clínica',
    athenaCostUSD: 38.7,
    s3CostUSD: 14.3,
    glueCostUSD: 8.4,
    totalCostUSD: 61.4,
    queryCount: 278,
    bytesScanned: 1_560_000_000_000,
    costPerQuery: 0.14,
    isAnomaly: false,
  },
  {
    userId: 'u-004',
    userName: 'Diego Ferreira',
    groupName: 'Analytics',
    athenaCostUSD: 248.5,
    s3CostUSD: 62.3,
    glueCostUSD: 31.2,
    totalCostUSD: 342.0,
    queryCount: 1_847,
    bytesScanned: 12_400_000_000_000,
    costPerQuery: 0.19,
    isAnomaly: true,
    anomalyReason: 'Custo 3x acima da média do grupo Analytics. Volume de queries Athena 6x superior ao esperado para o perfil. Possível varredura full-table sem filtros de partição.',
  },
  {
    userId: 'u-005',
    userName: 'Elena Rossi',
    groupName: 'Compliance',
    athenaCostUSD: 28.4,
    s3CostUSD: 22.1,
    glueCostUSD: 5.8,
    totalCostUSD: 56.3,
    queryCount: 156,
    bytesScanned: 780_000_000_000,
    costPerQuery: 0.18,
    isAnomaly: false,
  },
  {
    userId: 'u-006',
    userName: 'Fabio Santos',
    groupName: 'Engenharia de Dados',
    athenaCostUSD: 12.4,
    s3CostUSD: 28.7,
    glueCostUSD: 72.3,
    totalCostUSD: 113.4,
    queryCount: 64,
    bytesScanned: 640_000_000_000,
    costPerQuery: 0.19,
    isAnomaly: false,
  },
  {
    userId: 'u-007',
    userName: 'Gabriela Oliveira',
    groupName: 'Analytics',
    athenaCostUSD: 78.2,
    s3CostUSD: 24.6,
    glueCostUSD: 14.8,
    totalCostUSD: 117.6,
    queryCount: 534,
    bytesScanned: 3_200_000_000_000,
    costPerQuery: 0.15,
    isAnomaly: false,
  },
  {
    userId: 'u-008',
    userName: 'Henrique Costa',
    groupName: 'Externo (Parceiro)',
    athenaCostUSD: 124.8,
    s3CostUSD: 48.2,
    glueCostUSD: 14.0,
    totalCostUSD: 187.0,
    queryCount: 892,
    bytesScanned: 5_800_000_000_000,
    costPerQuery: 0.14,
    isAnomaly: true,
    anomalyReason: 'Usuário externo com custo elevado ($187) apesar de permissões limitadas. Padrão de acesso fora do horário comercial sugere uso não autorizado ou credenciais comprometidas.',
  },
];

function generateDailyTrends(): DailyUserCost[] {
  const trends: DailyUserCost[] = [];
  const baseDate = new Date('2026-09-07');

  for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + dayOffset);
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const weekendFactor = isWeekend ? 0.4 : 1.0;
    // Spike around day 22-25 correlating with u-004 anomalous activity
    const spikeFactor = dayOffset >= 22 && dayOffset <= 25 ? 1.8 : 1.0;

    for (const user of DEMO_USER_COSTS) {
      const dailyBase = user.totalCostUSD / 30;
      const noise = 0.7 + Math.random() * 0.6; // 0.7 to 1.3
      let cost = dailyBase * weekendFactor * noise * spikeFactor;

      // Extra spike for u-004 during anomalous period
      if (user.userId === 'u-004' && dayOffset >= 22 && dayOffset <= 25) {
        cost *= 1.5;
      }

      trends.push({
        date: dateStr,
        userId: user.userId,
        userName: user.userName,
        cost: Math.round(cost * 100) / 100,
      });
    }
  }

  return trends;
}

const DEMO_DAILY_TRENDS: DailyUserCost[] = generateDailyTrends();

const DEMO_GROUP_SUMMARIES: GroupCostSummary[] = [
  {
    groupId: 'g-analytics',
    groupName: 'Analytics',
    memberCount: 2,
    totalCostUSD: 459.6,
    avgCostPerUser: 229.8,
    topSpenderId: 'u-004',
    topSpenderName: 'Diego Ferreira',
  },
  {
    groupId: 'g-eng-dados',
    groupName: 'Engenharia de Dados',
    memberCount: 2,
    totalCostUSD: 262.0,
    avgCostPerUser: 131.0,
    topSpenderId: 'u-002',
    topSpenderName: 'Bruno Lima',
  },
  {
    groupId: 'g-externo',
    groupName: 'Externo (Parceiro)',
    memberCount: 1,
    totalCostUSD: 187.0,
    avgCostPerUser: 187.0,
    topSpenderId: 'u-008',
    topSpenderName: 'Henrique Costa',
  },
  {
    groupId: 'g-clinica',
    groupName: 'Equipe Clínica',
    memberCount: 2,
    totalCostUSD: 134.3,
    avgCostPerUser: 67.15,
    topSpenderId: 'u-001',
    topSpenderName: 'Ana Souza',
  },
  {
    groupId: 'g-compliance',
    groupName: 'Compliance',
    memberCount: 1,
    totalCostUSD: 56.3,
    avgCostPerUser: 56.3,
    topSpenderId: 'u-005',
    topSpenderName: 'Elena Rossi',
  },
];

const DEMO_ANALYTICS: UserCostAnalytics = {
  userCosts: DEMO_USER_COSTS,
  dailyTrends: DEMO_DAILY_TRENDS,
  groupSummaries: DEMO_GROUP_SUMMARIES,
  summary: {
    totalCost30d: 1099.2,
    totalQueries30d: 4170,
    avgCostPerUser: 137.4,
    usersAboveThreshold: 2,
    costliestGroupId: 'g-analytics',
    costliestGroupName: 'Analytics',
  },
};

export async function getUserCostData(): Promise<UserCostAnalytics> {
  // Em produção, consultaria AWS Cost Explorer + IAM + CloudTrail
  // Por agora retorna dados demo realistas
  return DEMO_ANALYTICS;
}