import { S3Client } from "@aws-sdk/client-s3";

const region = process.env.REGION;
const accessKeyId = process.env.ACCESS_KEY_ID;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

export const PUBLIC_BUCKET = process.env.PUBLIC_BUCKET ?? "";

export const s3Client = new S3Client({
  region,
  credentials:
    accessKeyId && secretAccessKey
      ? {
          accessKeyId,
          secretAccessKey,
        }
      : undefined,
});
