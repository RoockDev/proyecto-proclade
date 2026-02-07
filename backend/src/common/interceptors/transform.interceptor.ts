import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../types/api-response.type';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<unknown>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<unknown>> {
    return next.handle().pipe(
      map((data: unknown) => {
        let message = 'Operación realizada con éxito';
        let responseData: unknown = data;

        if (
          data &&
          typeof data === 'object' &&
          !Array.isArray(data) &&
          'message' in data &&
          typeof (data as { message?: unknown }).message === 'string'
        ) {
          const { message: customMessage, ...rest } = data as {
            message: string;
            [key: string]: unknown;
          };

          message = customMessage;
          responseData = Object.keys(rest).length > 0 ? rest : null;
        }

        return {
          success: true,
          message,
          data: responseData === undefined ? null : responseData,
        };
      }),
    );
  }
}
