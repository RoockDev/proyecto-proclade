import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync } from 'node:fs';
import { unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export type UploadedPdfFile = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

const MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024;

@Injectable()
export class HumanBookStorageService {
  async savePdf(file: UploadedPdfFile | undefined): Promise<{
    pdfUrl: string;
    pdfOriginalName: string;
    pdfMimeType: string;
    pdfSize: number;
  }> {
    if (!file) {
      throw new BadRequestException('Debes adjuntar un archivo PDF');
    }

    this.validatePdf(file);

    const uploadsDir = this.ensureUploadsDirectory();
    const filename = this.buildPdfFilename(file.originalname);
    const destinationPath = join(uploadsDir, filename);

    await writeFile(destinationPath, file.buffer);

    return {
      pdfUrl: `/uploads/human-books/${filename}`,
      pdfOriginalName: file.originalname,
      pdfMimeType: file.mimetype,
      pdfSize: file.size,
    };
  }

  async removePdf(pdfUrl: string): Promise<void> {
    const filename = pdfUrl.replace('/uploads/human-books/', '');
    const filePath = join(process.cwd(), 'uploads', 'human-books', filename);

    try {
      await unlink(filePath);
    } catch {
      // El archivo puede no existir, no es un error crítico
    }
  }

  private validatePdf(file: UploadedPdfFile): void {
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Solo se permiten archivos PDF');
    }

    if (file.size > MAX_PDF_SIZE_BYTES) {
      throw new BadRequestException('El PDF no puede superar los 10MB');
    }
  }

  private ensureUploadsDirectory(): string {
    const uploadsDir = join(process.cwd(), 'uploads', 'human-books');
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }
    return uploadsDir;
  }

  private buildPdfFilename(originalName: string): string {
    const baseName = this.normalizeBaseName(originalName);
    const uniqueFragment = randomUUID().slice(0, 8);

    return `human-book-${Date.now()}-${baseName}-${uniqueFragment}.pdf`;
  }

  private normalizeBaseName(originalName: string): string {
    const withoutExtension = originalName.replace(/\.pdf$/i, '');

    const normalized = withoutExtension
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return normalized || 'libro';
  }
}
