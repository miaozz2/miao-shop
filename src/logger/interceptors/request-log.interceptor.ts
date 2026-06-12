/**
 * 请求日志拦截器
 *
 * 功能：
 * - 自动记录所有写操作（POST/PUT/PATCH/DELETE）的详细信息
 * - 不记录 GET/HEAD 等查询操作，减少噪音
 *
 * 记录范围：
 * - POST: 注册、登录等创建操作
 * - PUT/PATCH: 更新数据
 * - DELETE: 删除数据
 *
 * 不记录：
 * - GET: 查询列表、详情等只读操作
 * - HEAD: 类似 GET，但不返回 body
 *
 * 为什么只记录写操作：
 * - 查询操作量大但价值有限
 * - 写操作涉及数据变更，需要审计
 * - 减少日志噪音，提高可维护性
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

/**
 * 需要记录日志的 HTTP 方法
 * @description 只有这些方法会记录日志
 * - POST: 创建资源
 * - PUT: 完整更新资源
 * - PATCH: 部分更新资源
 * - DELETE: 删除资源
 * - GET: 查询资源
 */
const LOGGABLE_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE', 'GET'];

@Injectable()
export class RequestLogInterceptor implements NestInterceptor {
  constructor(private readonly logsService: LogsService) {}

  /**
   * intercept - 拦截方法
   *
   * @param context - 执行上下文
   * @param next - 调用链
   * @returns Observable
   *
   * 流程：
   * 1. 提取请求信息（method, url, body, ip, userId）
   * 2. 判断是否为写操作
   * 3. 如果是写操作：监听响应，记录日志
   * 4. 如果是读操作：不记录，直接放行
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url, body, ip } = request;
    const userId = request.user?.userId?.toString() || 'anonymous';
    const action = `${method}:${url}`;

    /**
     * 判断是否为写操作
     * @description 只有 POST/PUT/PATCH/DELETE 才记录日志
     * - GET: 查询操作，不记录
     * - HEAD: 类似 GET，不记录
     */
    const shouldLog = LOGGABLE_METHODS.includes(method);

    if (!shouldLog) {
      /**
       * 读操作：直接放行，不记录日志
       * @description 使用 return next.handle() 跳过日志记录
       */
      return next.handle();
    }

    /**
     * 写操作：监听响应并记录日志
     */
    return next.handle().pipe(
      tap({
        next: (data) => {
          /**
           * fire-and-forget: 不等待日志写入完成
           * @description 使用 void 显式忽略 Promise，避免未处理的 Promise 警告
           * - 优点：响应速度快，不阻塞
           * - 缺点：服务器重启可能丢失日志
           */
          void this.logsService.create({
            userId,
            action,
            method,
            path: url,
            requestBody: JSON.stringify(body),
            responseBody:
              typeof data === 'object' ? JSON.stringify(data) : String(data),
            statusCode: response.statusCode,
            ip,
          });
        },
        error: (error) => {
          /**
           * fire-and-forget: 不等待日志写入完成
           * @description 使用 void 显式忽略 Promise，避免未处理的 Promise 警告
           * - 错误日志也需要记录，用于审计和调试
           */
          void this.logsService.create({
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
