import fs from 'fs/promises';
import path from 'path';

export interface ResumeStorage {
  save(buffer: Buffer, filename: string): Promise<string>;
  get(fileUrl: string): Promise<Buffer | null>;
  getSignedUrl(fileUrl: string): Promise<string>;
}

export class LocalStorageAdapter implements ResumeStorage {
  private storageDir: string;

  constructor() {
    this.storageDir = path.join(process.cwd(), 'storage', 'resumes');
  }

  private async ensureStorageDir() {
    try {
      await fs.access(this.storageDir);
    } catch {
      await fs.mkdir(this.storageDir, { recursive: true });
    }
  }

  async save(buffer: Buffer, filename: string): Promise<string> {
    await this.ensureStorageDir();
    const safeFilename = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(this.storageDir, safeFilename);
    
    await fs.writeFile(filePath, buffer);
    // Returns a relative URL path that can be used to identify the local file
    return `/storage/resumes/${safeFilename}`;
  }

  async get(fileUrl: string): Promise<Buffer | null> {
    try {
      const filename = path.basename(fileUrl);
      const filePath = path.join(this.storageDir, filename);
      return await fs.readFile(filePath);
    } catch (error) {
      return null;
    }
  }

  async getSignedUrl(fileUrl: string): Promise<string> {
    // For local dev, we'll route through our own API endpoint that reads and serves the file
    // Example: /api/v1/storage/resumes?file=12345.pdf
    const filename = path.basename(fileUrl);
    return `/api/v1/storage/resumes?file=${filename}`;
  }
}

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export class S3StorageAdapter implements ResumeStorage {
  private s3: S3Client;
  private bucket: string;

  constructor() {
    this.s3 = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      }
    });
    this.bucket = process.env.AWS_S3_BUCKET || 'talentflow-resumes';
  }

  async save(buffer: Buffer, filename: string): Promise<string> {
    const safeFilename = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    await this.s3.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: safeFilename,
      Body: buffer,
    }));
    return `s3://${this.bucket}/${safeFilename}`;
  }

  async get(fileUrl: string): Promise<Buffer | null> {
    try {
      const filename = fileUrl.split('/').pop()!;
      const data = await this.s3.send(new GetObjectCommand({
        Bucket: this.bucket,
        Key: filename
      }));
      if (data.Body) {
        return Buffer.from(await data.Body.transformToByteArray());
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async getSignedUrl(fileUrl: string): Promise<string> {
    try {
      const filename = fileUrl.split('/').pop()!;
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: filename
      });
      // URL expires in 1 hour
      return await getSignedUrl(this.s3, command, { expiresIn: 3600 });
    } catch (error) {
      return '';
    }
  }
}

export const resumeStorage: ResumeStorage = process.env.NODE_ENV === 'production' 
  ? new S3StorageAdapter() 
  : new LocalStorageAdapter();
