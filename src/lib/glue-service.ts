import { GetJobsCommand, GetJobRunsCommand } from '@aws-sdk/client-glue';
import { getGlueClient, isDemoMode } from './aws-client';
import type { GlueJob, GlueJobRun } from './types';

const MAX_RUNS_PER_JOB = 10;

export async function getJobsWithRecentRuns(): Promise<GlueJob[]> {
  if (isDemoMode()) return getDemoJobs();

  const client = await getGlueClient();
  const jobsResponse = await client.send(new GetJobsCommand({ MaxResults: 100 }));
  const jobs: GlueJob[] = [];

  for (const job of jobsResponse.Jobs || []) {
    if (!job.Name) continue;

    let recentRuns: GlueJobRun[] = [];
    try {
      const runsResponse = await client.send(
        new GetJobRunsCommand({ JobName: job.Name, MaxResults: MAX_RUNS_PER_JOB })
      );

      recentRuns = (runsResponse.JobRuns || []).map((run) => ({
        id: run.Id || 'unknown',
        status: (run.JobRunState as GlueJobRun['status']) || 'STOPPED',
        startedAt: run.StartedOn?.toISOString() || null,
        completedAt: run.CompletedOn?.toISOString() || null,
        durationSeconds:
          run.ExecutionTime ??
          (run.StartedOn && run.CompletedOn
            ? Math.round((run.CompletedOn.getTime() - run.StartedOn.getTime()) / 1000)
            : null),
        errorMessage: run.ErrorMessage || null,
        logUrl: run.LogGroupName
          ? `https://console.aws.amazon.com/cloudwatch/home#logsV2:log-groups/log-group/${encodeURIComponent(run.LogGroupName)}`
          : null,
      }));
    } catch {
      // Skip jobs whose runs we can't fetch
    }

    jobs.push({
      name: job.Name,
      type: job.Command?.Name || 'UNKNOWN',
      state: (job as Record<string, unknown>).State as string || 'UNKNOWN',
      lastModified: job.LastModifiedOn?.toISOString() || new Date().toISOString(),
      recentRuns,
    });
  }

  return jobs;
}

function getDemoJobs(): GlueJob[] {
  return [
    {
      name: 'etl-sales-daily',
      type: 'glueetl',
      state: 'READY',
      lastModified: new Date(Date.now() - 86400000).toISOString(),
      recentRuns: [
        { id: 'jr-001', status: 'SUCCEEDED', startedAt: new Date(Date.now() - 7200000).toISOString(), completedAt: new Date(Date.now() - 5400000).toISOString(), durationSeconds: 1800, errorMessage: null, logUrl: null },
        { id: 'jr-002', status: 'SUCCEEDED', startedAt: new Date(Date.now() - 93600000).toISOString(), completedAt: new Date(Date.now() - 91800000).toISOString(), durationSeconds: 1800, errorMessage: null, logUrl: null },
        { id: 'jr-003', status: 'FAILED', startedAt: new Date(Date.now() - 180000000).toISOString(), completedAt: new Date(Date.now() - 178200000).toISOString(), durationSeconds: 1800, errorMessage: 'OutOfMemoryError: Spark executor lost', logUrl: null },
      ],
    },
    {
      name: 'etl-inventory-sync',
      type: 'glueetl',
      state: 'READY',
      lastModified: new Date(Date.now() - 172800000).toISOString(),
      recentRuns: [
        { id: 'jr-004', status: 'RUNNING', startedAt: new Date(Date.now() - 300000).toISOString(), completedAt: null, durationSeconds: null, errorMessage: null, logUrl: null },
        { id: 'jr-005', status: 'SUCCEEDED', startedAt: new Date(Date.now() - 86700000).toISOString(), completedAt: new Date(Date.now() - 84900000).toISOString(), durationSeconds: 1800, errorMessage: null, logUrl: null },
      ],
    },
    {
      name: 'crawler-customers',
      type: 'gluecrawler',
      state: 'READY',
      lastModified: new Date(Date.now() - 43200000).toISOString(),
      recentRuns: [
        { id: 'jr-006', status: 'SUCCEEDED', startedAt: new Date(Date.now() - 14400000).toISOString(), completedAt: new Date(Date.now() - 14100000).toISOString(), durationSeconds: 300, errorMessage: null, logUrl: null },
      ],
    },
    {
      name: 'etl-analytics-aggregate',
      type: 'glueetl',
      state: 'READY',
      lastModified: new Date(Date.now() - 3600000).toISOString(),
      recentRuns: [
        { id: 'jr-007', status: 'FAILED', startedAt: new Date(Date.now() - 3600000).toISOString(), completedAt: new Date(Date.now() - 3300000).toISOString(), durationSeconds: 300, errorMessage: 'AccessDeniedException: Insufficient permissions on target table', logUrl: null },
        { id: 'jr-008', status: 'FAILED', startedAt: new Date(Date.now() - 90000000).toISOString(), completedAt: new Date(Date.now() - 89700000).toISOString(), durationSeconds: 300, errorMessage: 'AnalysisException: Column mismatch in schema', logUrl: null },
      ],
    },
  ];
}