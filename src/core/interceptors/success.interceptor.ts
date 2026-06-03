/**
 * 全局响应拦截器
 *
 * 为什么需要统一响应格式：
 * - 所有接口返回一致的成功结构
 * - 统一包装 data、statusCode、timestamp
 *
 * 成功格式：
 * {
 *   statusCode: number,
 *   data: any,
 *   timestamp: string
 * }
 */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class SuccessInterceptor<T>
  implements NestInterceptor<T, { statusCode: number; data: T; timestamp: string }>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<{ statusCode: number; data: T; timestamp: string }> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<{ statusCode?: number }>();

    return next.handle().pipe(
      map((data) => ({
        statusCode: response.statusCode || 200,
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
