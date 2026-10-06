import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getS3Client, isDemoMode } from './aws-client';
import type { StorageSummary, StorageBreakdown, DatasetFreshness } from './types';

const BUCKET = process.env.S3_BUCKET || 'datalake-health-demo';
const LAYERS = ['raw', 'staging', 'curated'] as const;

export async function getStorageBreakdown(): Promise<StorageSummary> {
  if (isDemoMode()) return getDemoStorage();

  const client = await getS3Client();
  const layers: StorageBreakdown[] = [];
  let totalSize = 0;
  let totalFiles = 0;

  for (const layer of LAYERS) {
    let sizeBytes = 0;
    let fileCount = 0;
    const formats: Record<string, number> = {};
    let continuationToken: string | undefined;

    do {
      const response = await client.send(
        new ListObjectsV2Command({
          Bucket: BUCKET,
          Prefix: `${layer}/`,
          ContinuationToken: continuationToken,
        })
      );

      for (const obj of response.Contents || []) {
        const size = obj.Size || 0;
        sizeBytes += size;
        fileCount++;

        const ext = obj.Key?.split('.').pop()?.toLowerCase() || 'unknown';
        formats[ext] = (formats[ext] || 0) + size;
      }

      continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    layers.push({ layer, sizeBytes, fileCount, formats });
    totalSize += sizeBytes;
    totalFiles += fileCount;
  }

  return {
    totalSizeBytes: totalSize,
    totalFiles,
    layers,
    trend: [], // CloudWatch trend populated separately
  };
}

export async function getDatasetFreshness(prefixes: string[]): Promise<DatasetFreshness[]> {
  if (isDemoMode()) return getDemoFreshness();

  const client = await getS3Client();
  const results: DatasetFreshness[] = [];

  for (const prefix of prefixes) {
    try {
      const response = await client.send(
        new ListObjectsV2Command({
          Bucket: BUCKET,
          Prefix: prefix,
          MaxKeys: 1,
        })
      );

      const lastModified = response.Contents?.[0]?.LastModified;
      if (!lastModified) continue;

      const delayHours = Math.abs(Date.now() - lastModified.getTime()) / (1000 * 60 * 60);
      const slaHours = 24; // Default SLA

      results.push({
        dataset: prefix.replace(/\/$/, ''),
        lastUpdated: lastModified.toISOString(),
        slaHours,
        delayHours: Math.round(delayHours * 10) / 10,
        status: delayHours > slaHours ? 'critical' : delayHours > slaHours * 0.8 ? 'warning' : 'healthy',
      });
    } catch {
      // Skip inaccessible prefixes
    }
  }

  return results;
}

// Demo mode data
function getDemoStorage(): StorageSummary {
  return {
    totalSizeBytes: 5_420_000_000_000,
    totalFiles: 12_450_000,
    layers: [
      { layer: 'raw', sizeBytes: 3_200_000_000_000, fileCount: 8_200_000, formats: { parquet: 2_800_000_000_000, csv: 400_000_000_000 } },
      { layer: 'staging', sizeBytes: 1_500_000_000_000, fileCount: 3_100_000, formats: { parquet: 1_500_000_000_000 } },
      { layer: 'curated', sizeBytes: 720_000_000_000, fileCount: 1_150_000, formats: { parquet: 700_000_000_000, json: 20_000_000_000 } },
    ],
    trend: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split('T')[0],
      sizeBytes: 5_420_000_000_000 - (29 - i) * 15_000_000_000,
    })),
  };
}

function getDemoFreshness(): DatasetFreshness[] {
  return [
    { dataset: 'raw/sales', lastUpdated: new Date(Date.now() - 3600000).toISOString(), slaHours: 24, delayHours: 1, status: 'healthy' },
    { dataset: 'raw/inventory', lastUpdated: new Date(Date.now() - 72000000).toISOString(), slaHours: 24, delayHours: 20, status: 'warning' },
    { dataset: 'staging/customers', lastUpdated: new Date(Date.now() - 172800000).toISOString(), slaHours: 24, delayHours: 48, status: 'critical' },
    { dataset: 'curated/analytics', lastUpdated: new Date(Date.now() - 1800000).toISOString(), slaHours: 12, delayHours: 0.5, status: 'healthy' },
  ];
}