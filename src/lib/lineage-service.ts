// Serviço de Linhagem de Dados — HealthLake
// Tipos e dados demo para o grafo de linhagem do datalake

export interface LineageNode {
  id: string;
  label: string;
  layer: 'raw' | 'staging' | 'curated';
  type: 'table' | 'job';
}

export interface LineageEdge {
  source: string;
  target: string;
  jobName: string;
}

export interface LineageGraph {
  nodes: LineageNode[];
  edges: LineageEdge[];
  stats: {
    totalNodes: number;
    totalEdges: number;
    rawTables: number;
    stagingTables: number;
    curatedTables: number;
    activeJobs: number;
  };
}

const DEMO_NODES: LineageNode[] = [
  // Raw layer — fontes de dados brutos
  { id: 'raw_patients', label: 'patients_raw', layer: 'raw', type: 'table' },
  { id: 'raw_encounters', label: 'encounters_raw', layer: 'raw', type: 'table' },
  { id: 'raw_claims', label: 'claims_raw', layer: 'raw', type: 'table' },
  { id: 'raw_providers', label: 'providers_raw', layer: 'raw', type: 'table' },
  { id: 'raw_medications', label: 'medications_raw', layer: 'raw', type: 'table' },

  // Jobs ETL — Glue jobs que transformam os dados
  { id: 'job_ingest_patients', label: 'glue_ingest_patients', layer: 'raw', type: 'job' },
  { id: 'job_ingest_encounters', label: 'glue_ingest_encounters', layer: 'raw', type: 'job' },
  { id: 'job_ingest_claims', label: 'glue_ingest_claims', layer: 'raw', type: 'job' },
  { id: 'job_clean_providers', label: 'glue_clean_providers', layer: 'staging', type: 'job' },
  { id: 'job_clean_meds', label: 'glue_clean_medications', layer: 'staging', type: 'job' },
  { id: 'job_curate_patients', label: 'glue_curate_patients', layer: 'curated', type: 'job' },
  { id: 'job_curate_claims', label: 'glue_curate_claims', layer: 'curated', type: 'job' },
  { id: 'job_curate_analytics', label: 'glue_curate_analytics', layer: 'curated', type: 'job' },

  // Staging layer — dados limpos e validados
  { id: 'stg_patients', label: 'patients_stg', layer: 'staging', type: 'table' },
  { id: 'stg_encounters', label: 'encounters_stg', layer: 'staging', type: 'table' },
  { id: 'stg_claims', label: 'claims_stg', layer: 'staging', type: 'table' },
  { id: 'stg_providers', label: 'providers_stg', layer: 'staging', type: 'table' },
  { id: 'stg_medications', label: 'medications_stg', layer: 'staging', type: 'table' },

  // Curated layer — tabelas finais para consumo
  { id: 'cur_patient_360', label: 'patient_360', layer: 'curated', type: 'table' },
  { id: 'cur_claims_summary', label: 'claims_summary', layer: 'curated', type: 'table' },
  { id: 'cur_provider_directory', label: 'provider_directory', layer: 'curated', type: 'table' },
  { id: 'cur_analytics_dashboard', label: 'analytics_dashboard', layer: 'curated', type: 'table' },
];

const DEMO_EDGES: LineageEdge[] = [
  // Ingestão raw → staging
  { source: 'raw_patients', target: 'job_ingest_patients', jobName: 'glue_ingest_patients' },
  { source: 'job_ingest_patients', target: 'stg_patients', jobName: 'glue_ingest_patients' },

  { source: 'raw_encounters', target: 'job_ingest_encounters', jobName: 'glue_ingest_encounters' },
  { source: 'job_ingest_encounters', target: 'stg_encounters', jobName: 'glue_ingest_encounters' },

  { source: 'raw_claims', target: 'job_ingest_claims', jobName: 'glue_ingest_claims' },
  { source: 'job_ingest_claims', target: 'stg_claims', jobName: 'glue_ingest_claims' },

  { source: 'raw_providers', target: 'job_clean_providers', jobName: 'glue_clean_providers' },
  { source: 'job_clean_providers', target: 'stg_providers', jobName: 'glue_clean_providers' },

  { source: 'raw_medications', target: 'job_clean_meds', jobName: 'glue_clean_medications' },
  { source: 'job_clean_meds', target: 'stg_medications', jobName: 'glue_clean_medications' },

  // Curated — transformação staging → curated
  { source: 'stg_patients', target: 'job_curate_patients', jobName: 'glue_curate_patients' },
  { source: 'stg_encounters', target: 'job_curate_patients', jobName: 'glue_curate_patients' },
  { source: 'job_curate_patients', target: 'cur_patient_360', jobName: 'glue_curate_patients' },

  { source: 'stg_claims', target: 'job_curate_claims', jobName: 'glue_curate_claims' },
  { source: 'stg_medications', target: 'job_curate_claims', jobName: 'glue_curate_claims' },
  { source: 'job_curate_claims', target: 'cur_claims_summary', jobName: 'glue_curate_claims' },

  { source: 'stg_providers', target: 'job_curate_analytics', jobName: 'glue_curate_analytics' },
  { source: 'stg_patients', target: 'job_curate_analytics', jobName: 'glue_curate_analytics' },
  { source: 'stg_encounters', target: 'job_curate_analytics', jobName: 'glue_curate_analytics' },
  { source: 'job_curate_analytics', target: 'cur_provider_directory', jobName: 'glue_curate_analytics' },
  { source: 'job_curate_analytics', target: 'cur_analytics_dashboard', jobName: 'glue_curate_analytics' },
];

function computeStats(nodes: LineageNode[], edges: LineageEdge[]): LineageGraph['stats'] {
  const tables = nodes.filter((n) => n.type === 'table');
  return {
    totalNodes: nodes.length,
    totalEdges: edges.length,
    rawTables: tables.filter((t) => t.layer === 'raw').length,
    stagingTables: tables.filter((t) => t.layer === 'staging').length,
    curatedTables: tables.filter((t) => t.layer === 'curated').length,
    activeJobs: nodes.filter((n) => n.type === 'job').length,
  };
}

export async function getLineageGraph(): Promise<LineageGraph> {
  // Em modo demo, retorna dados estáticos realistas
  // Com credenciais AWS, aqui seria feita chamada ao Glue Data Catalog / Lake Formation
  return {
    nodes: DEMO_NODES,
    edges: DEMO_EDGES,
    stats: computeStats(DEMO_NODES, DEMO_EDGES),
  };
}