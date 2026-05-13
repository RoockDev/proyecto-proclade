import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync } from 'node:fs';
import { unlink, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

export type UploadedNewsImageFile = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

const MAX_NEWS_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const NEWS_UPLOADS_DIRECTORY = join(process.cwd(), 'uploads', 'news');
const NEWS_IMAGE_URL_PREFIX = '/uploads/news/';

const ALLOWED_IMAGE_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
]);

const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

@Injectable()
export class NewsImageStorageService {
  async saveNewsImage(
    file: UploadedNewsImageFile | undefined,
  ): Promise<string> {
    if (!file) {
      throw new BadRequestException('Debes adjuntar una imagen');
    }

    this.validateFile(file);

    const uploadsDirectory = this.ensureNewsUploadsDirectory();
    const filename = this.buildNewsImageFilename(file.originalname);
    const destinationPath = join(uploadsDirectory, filename);

    await writeFile(destinationPath, file.buffer);

    return `${NEWS_IMAGE_URL_PREFIX}${filename}`;
  }

  async removeNewsImage(imageUrl: string | null | undefined): Promise<void> {
    const filePath = this.resolveLocalImagePath(imageUrl);
    if (!filePath) {
      return;
    }

    try {
      await unlink(filePath);
    } catch {
      // El archivo puede no existir ya; no es un error critico.
    }
  }

  private validateFile(file: UploadedNewsImageFile): void {
    const extension = extname(file.originalname).toLowerCase();

    if (
      !ALLOWED_IMAGE_EXTENSIONS.has(extension) ||
      !ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype)
    ) {
      throw new BadRequestException(
        'Solo se permiten imágenes JPG, PNG, WEBP o GIF',
      );
    }

    if (file.size > MAX_NEWS_IMAGE_SIZE_BYTES) {
      throw new BadRequestException('La imagen no puede superar los 5MB');
    }
  }

  private ensureNewsUploadsDirectory(): string {
    if (!existsSync(NEWS_UPLOADS_DIRECTORY)) {
      mkdirSync(NEWS_UPLOADS_DIRECTORY, { recursive: true });
    }
    return NEWS_UPLOADS_DIRECTORY;
  }

  private buildNewsImageFilename(originalName: string): string {
    const extension = extname(originalName).toLowerCase();
    const safeExtension = ALLOWED_IMAGE_EXTENSIONS.has(extension)
      ? extension
      : '.jpg';
    const baseName = this.normalizeFileBaseName(originalName);
    const uniqueFragment = randomUUID().slice(0, 8);

    return `news-${Date.now()}-${baseName}-${uniqueFragment}${safeExtension}`;
  }

  private normalizeFileBaseName(originalName: string): string {
    const extension = extname(originalName).toLowerCase();
    const baseName = originalName.slice(
      0,
      originalName.length - extension.length,
    );

    const normalized = baseName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return normalized || 'news-image';
  }

  private resolveLocalImagePath(
    imageUrl: string | null | undefined,
  ): string | null {
    if (!imageUrl?.startsWith(NEWS_IMAGE_URL_PREFIX)) {
      return null;
    }

    const filename = imageUrl.slice(NEWS_IMAGE_URL_PREFIX.length);
    if (!filename || filename.includes('/') || filename.includes('\\')) {
      return null;
    }

    return join(NEWS_UPLOADS_DIRECTORY, filename);
  }
}
