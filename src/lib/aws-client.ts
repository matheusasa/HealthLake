import { S3Client } from '@aws-sdk/client-s3';
import { GlueClient } from '@aws-sdk/client-glue';
import { AthenaClient } from '@aws-sdk/client-athena';
import { CloudWatchClient } from '@aws-sdk/client-cloudwatch';
import { STSClient, AssumeRoleCommand } from '@aws-sdk/client-sts';

const region = process.env.AWS_REGION || 'us-east-1';

let s3Client: S3Client | null = null;
let glueClient: GlueClient | null = null;
let athenaClient: AthenaClient | null = null;
let cloudWatchClient: CloudWatchClient | null = null;

async function getCredentials() {
  const roleArn = process.env.AWS_ROLE_ARN;
  if (!roleArn) return undefined;

  const sts = new STSClient({ region });
  const response = await sts.send(
    new AssumeRoleCommand({
      RoleArn: roleArn,
      RoleSessionName: 'healthlake-dashboard',
      DurationSeconds: 3600,
    })
  );

  if (!response.Credentials) return undefined;

  return {
    accessKeyId: response.Credentials.AccessKeyId!,
    secretAccessKey: response.Credentials.SecretAccessKey!,
    sessionToken: response.Credentials.SessionToken,
  };
}

export async function getS3Client(): Promise<S3Client> {
  if (!s3Client) {
    const credentials = await getCredentials();
    s3Client = new S3Client({ region, credentials });
  }
  return s3Client;
}

export async function getGlueClient(): Promise<GlueClient> {
  if (!glueClient) {
    const credentials = await getCredentials();
    glueClient = new GlueClient({ region, credentials });
  }
  return glueClient;
}

export async function getAthenaClient(): Promise<AthenaClient> {
  if (!athenaClient) {
    const credentials = await getCredentials();
    athenaClient = new AthenaClient({ region, credentials });
  }
  return athenaClient;
}

export async function getCloudWatchClient(): Promise<CloudWatchClient> {
  if (!cloudWatchClient) {
    const credentials = await getCredentials();
    cloudWatchClient = new CloudWatchClient({ region, credentials });
  }
  return cloudWatchClient;
}

export function isDemoMode(): boolean {
  return !process.env.AWS_ACCESS_KEY_ID && !process.env.AWS_PROFILE && !process.env.AWS_ROLE_ARN;
}