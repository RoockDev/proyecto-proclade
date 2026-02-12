import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from '../types/api-response.type';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = this.resolveMessage(exception);

    const body: ApiResponse<null> = {
      success: false,
      message,
      data: null,
    };

    response.status(status).json(body);
  }

  private resolveMessage(exception: unknown): string {
    if (exception instanceof HttpException) {
      const errorResponse = exception.getResponse();

      if (
        typeof errorResponse === 'object' &&
        errorResponse !== null &&
        'message' in errorResponse
      ) {
        const msg = (errorResponse as { message: string | string[] }).message;
        return Array.isArray(msg) ? msg.join('. ') : msg;
      }

      if (typeof errorResponse === 'string') {
        return errorResponse;
      }
    }

    if (exception instanceof Error) {
      return exception.message;
    }

    return 'Error interno del servidor';
  }
}
