import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { HumanBooksService } from './human-books.service';

@Controller('human-books')
export class HumanBooksController {
  constructor(private readonly humanBooksService: HumanBooksService) {}

  @Get()
  findAllPublished() {
    return this.humanBooksService.findAllPublished();
  }

  @Get(':slug/download')
  async downloadPdf(@Param('slug') slug: string, @Res() res: Response) {
    const book = await this.humanBooksService.findBySlugForDownload(slug);

    const relativePath = book.pdfUrl.replace(/^\/uploads\//, '');
    const filePath = join(process.cwd(), 'uploads', relativePath);

    if (!existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Archivo PDF no encontrado',
        data: null,
      });
    }

    res.setHeader('Content-Type', book.pdfMimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${book.pdfOriginalName}"`,
    );

    return res.sendFile(filePath);
  }
}
