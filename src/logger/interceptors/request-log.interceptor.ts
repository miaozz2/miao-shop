/**
 * 请求日志拦截器
 *
 * 自动记录所有 HTTP 请求的详细信息
 */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LogsService } from '@/logger/logs.service';

@Injectable()
export class RequestLogInterceptor implements NestInterceptor {
  constructor(private readonly logsService: LogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url, body, ip } = request;
    const userId = request.user?.userId?.toString() || 'anonymous';
    const action = `${method}:${url}`;

    return next.handle().pipe(
      tap({
        next: (data) => {
          this.logsService.create({
            userId,
            action,
            method,
            path: url,
            requestBody: JSON.stringify(body),
            responseBody: typeof data === 'object' ? JSON.stringify(data) : String(data),
            statusCode: response.statusCode,
            ip,
          });
        },
        error: (error) => {
          this.logsService.create({
            userId,
            action,
            method,
            path: url,
            requestBody: JSON.stringify(body),
            responseBody: error.message,
            statusCode: error.status || 500,
            ip,
          });
        },
      }),
    );
  }
}
