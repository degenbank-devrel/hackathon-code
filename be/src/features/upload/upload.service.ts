/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
@Injectable()
export class UploadService {
  private s3Client: S3Client;
  private bucketName: string;
  private baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    const accessKeyId = this.configService.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'R2_SECRET_ACCESS_KEY',
    );
    this.baseUrl = this.configService.get<string>('R2_PUBLIC_DOMAIN') || '';
    this.bucketName = this.configService.get<string>('R2_BUCKET_NAME') || '';

    const config = {
      region: 'auto',
      endpoint: `https://ed65f8e042514bf5820c6e88a78c76e6.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
    };

    this.s3Client = new S3Client(config as unknown as any);
  }

  public async uploadFile(
    folderName: string,
    file: Express.Multer.File,
    spesificName?: string,
  ) {
    if (file.size > 20 * 1024 * 1024) {
      throw new HttpException(
        'File size exceeds 20 MB',
        HttpStatus.BAD_REQUEST,
      );
    }

    const fileName = spesificName || this.generateIpfsFileName();
    const params = {
      Bucket: this.bucketName,
      Key: `${folderName}/${fileName}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };
    const command = new PutObjectCommand(params);
    await this.s3Client.send(command);

    return this.getFileURL(`${folderName}/${fileName}`);
  }

  public async uploadFileIPFS(file: Express.Multer.File) {
    if (file.size > 20 * 1024 * 1024) {
      throw new HttpException(
        'File size exceeds 20 MB',
        HttpStatus.BAD_REQUEST,
      );
    }

    const fileName = this.generateIpfsFileName();
    const params = {
      Bucket: this.bucketName,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    };
    const command = new PutObjectCommand(params);
    await this.s3Client.send(command);

    return this.getFileURL(`${fileName}`);
  }

  getFileURL(fileName: string) {
    return `${this.baseUrl}/${fileName}`;
  }

  generateIpfsFileName(): string {
    const hash = createHash('sha256');
    hash.update(Date.now().toString());
    return hash.digest('hex');
  }
}
