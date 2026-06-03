/**
 * 全局异常过滤器
 *
 * 为什么需要统一错误格式：
 * - 所有接口返回一致的错误结构，便于前端处理
 * - 避免不同模块抛出不同格式的错误
 *
 * 错误格式：
 * {
 *   statusCode: number,
 *   message: string | string[],
 *   error: string,
 *   timestamp: string,
 *   path: string
 * }
 */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse() instanceof Object
          ? ((exception.getResponse() as any).message ?? exception.message)
          : exception.message
        : 'Internal server error';

    response.status(status).json({
      statusCode: status,
      message: Array.isArray(message) ? message.join(', ') : message,
      error: HttpStatus[status] || 'Error',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
