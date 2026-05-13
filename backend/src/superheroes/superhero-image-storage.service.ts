import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync } from 'node:fs';
import { unlink, writeFile } from 'node:fs/promises';
import { extname } from 'node:path';
import { join } from 'node:path';

const SUPERHERO_UPLOADS_DIRECTORY = join(
  process.cwd(),
  'uploads',
  'superheroes',
);
const SUPERHERO_IMAGE_URL_PREFIX = '/uploads/superheroes/';
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

const ALLOWED_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

export type UploadedSuperheroImageFile = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

@Injectable()
export class SuperheroImageStorageService {
  async saveImage(
    file: UploadedSuperheroImageFile | undefined,
    baseName: string,
  ): Promise<string | undefined> {
    if (!file) {
      return undefined;
    }

    this.validateImage(file);

    const uploadsDirectory = this.ensureUploadsDirectory();
    const filename = this.buildImageFilename(file.originalname, baseName);
    const destinationPath = join(uploadsDirectory, filename);

    await writeFile(destinationPath, file.buffer);

    return `${SUPERHERO_IMAGE_URL_PREFIX}${filename}`;
  }

  async removeImage(imageUrl: string | null | undefined): Promise<void> {
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

  private validateImage(file: UploadedSuperheroImageFile): void {
    const extension = extname(file.originalname).toLowerCase();

    if (
      !ALLOWED_IMAGE_EXTENSIONS.has(extension) ||
      !ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype)
    ) {
      throw new BadRequestException(
        'Solo se permiten imágenes JPG, PNG o WEBP',
      );
    }

    if (file.size > MAX_IMAGE_SIZE) {
      throw new BadRequestException('La imagen no puede superar los 2MB');
    }
  }

  private ensureUploadsDirectory(): string {
    if (!existsSync(SUPERHERO_UPLOADS_DIRECTORY)) {
      mkdirSync(SUPERHERO_UPLOADS_DIRECTORY, { recursive: true });
    }

    return SUPERHERO_UPLOADS_DIRECTORY;
  }

  private buildImageFilename(originalName: string, baseName: string): string {
    const extension = extname(originalName).toLowerCase();
    const safeExtension = ALLOWED_IMAGE_EXTENSIONS.has(extension)
      ? extension
      : '.png';
    const safeBase = this.normalizeBaseName(baseName || originalName);
    const uniqueFragment = randomUUID().slice(0, 8);

    return `superhero-${Date.now()}-${safeBase}-${uniqueFragment}${safeExtension}`;
  }

  private normalizeBaseName(value: string): string {
    const extension = extname(value).toLowerCase();
    const withoutExtension = extension
      ? value.slice(0, value.length - extension.length)
      : value;

    const normalized = withoutExtension
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return normalized || 'superheroe';
  }

  private resolveLocalImagePath(
    imageUrl: string | null | undefined,
  ): string | null {
    if (!imageUrl?.startsWith(SUPERHERO_IMAGE_URL_PREFIX)) {
      return null;
    }

    const filename = imageUrl.slice(SUPERHERO_IMAGE_URL_PREFIX.length);
    if (!filename || filename.includes('/') || filename.includes('\\')) {
      return null;
    }

    return join(SUPERHERO_UPLOADS_DIRECTORY, filename);
  }
}
