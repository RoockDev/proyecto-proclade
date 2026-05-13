import { Injectable } from '@nestjs/common';
import { unlink } from 'node:fs/promises';
import { join } from 'node:path';

const SUPERHERO_UPLOADS_DIRECTORY = join(
  process.cwd(),
  'uploads',
  'superheroes',
);
const SUPERHERO_IMAGE_URL_PREFIX = '/uploads/superheroes/';

@Injectable()
export class SuperheroImageStorageService {
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
