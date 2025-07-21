import { Router } from 'express';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { StatusCodes } from 'http-status-codes';
import dotenv from 'dotenv';
dotenv.config();

const router = Router();

export const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export class AwsS3Service {
  constructor(private client: S3Client) {}

  async getPresignedPutUrl(key: string, contentType: string, expiresIn = 500): Promise<string> {
    const cmd = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET,
      Key: key,
      ContentType: contentType,
    });
    return await getSignedUrl(this.client, cmd, { expiresIn });
  }
}

const awsS3 = new AwsS3Service(s3Client);

router.get('/presign', async (req, res) => {
  try {
    const { filename, contentType } = req.query as {
      filename?: string;
      contentType?: string;
    };
    if (!filename || !contentType) {
      return res.status(400).json({ error: 'filename, contentType를 채워주세요' });
    }

    const key = `uploads/${Date.now()}-${randomUUID()}-${filename}`;
    const url = await awsS3.getPresignedPutUrl(key, contentType, 60);

    return res.status(StatusCodes.OK).json({ url, key });
  } catch (err) {
    console.error(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Presign URL 생성 중 오류가 발생했습니다.' });
  }
});

router.post('/complete', (req, res) => {
  const { key } = req.body as { key?: string };
  if (!key) return res.status(400).json({ message: 'key가 필요합니다' });
  try {
    const publicUrl = `https://${process.env.AWS_BUCKET}.s3.amazonaws.com/${key}`;
    return res.json({ message: '업로드 완료', url: publicUrl });
  } catch (err) {
    console.error(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: '업로드 완료 중 오류가 발생했습니다.' });
  }
});

export default router;
