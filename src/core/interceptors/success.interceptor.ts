/**
 * 全局响应拦截器
 *
 * 为什么需要统一响应格式：
 * - 所有接口返回一致的成功结构
 * - 统一包装 data、statusCode、timestamp
 *
 * 成功格式：
 * ```json
 * {
 *   "statusCode": 200,
 *   "data": { ... },
 *   "timestamp": "2024-01-01T00:00:00.000Z"
 * }
 * ```
 *
 * 工作原理：
 * 1. 拦截所有响应
 * 2. 使用 map 操作符转换响应数据
 * 3. 统一包装为 { statusCode, data, timestamp } 格式
 *
 * 关联性：
 * - 在 main.ts 中通过 app.useGlobalInterceptors() 注册
 * - 所有 Controller 的返回值都会经过此拦截器
 */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * @Injectable() 装饰器
 * @description 声明 SuccessInterceptor 为 NestJS 可注入拦截器
 * - 实现 NestInterceptor 接口
 * - 用于拦截和转换响应数据
 */
@Injectable()
export class SuccessInterceptor<T> implements NestInterceptor<
  T,
  { statusCode: number; data: T; timestamp: string }
> {
  /**
   * intercept - 拦截方法
   *
   * 为什么需要 intercept：
   * - NestJS 拦截器必须实现的方法
   * - 在响应发送给客户端之前拦截
   *
   * @param context - 执行上下文，包含请求和响应信息
   * @param next - 调用链，用于获取原始响应
   * @returns Observable 转换后的响应
   *
   * 流程：
   * 1. 从 context 获取 HTTP 响应对象
   * 2. 调用 next.handle() 获取原始响应 Observable
   * 3. 使用 map 转换响应数据
   * 4. 返回统一格式的响应
   */
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<{ statusCode: number; data: T; timestamp: string }> {
    /**
     * 获取 HTTP 上下文
     * @description 用于提取请求和响应对象
     */
    const ctx = context.switchToHttp();

    /**
     * 获取响应对象
     * @description 从 HTTP 上下文获取 Response 对象
     * - 用于读取 statusCode
     * - 类型标记为可选，因为不是所有环境都有 statusCode
     */
    const response = ctx.getResponse<{ statusCode?: number }>();

    /**
     * 转换响应数据
     * @description 使用 pipe + map 将原始数据转换为统一格式
     *
     * 转换逻辑：
     * - statusCode: 从 response.statusCode 读取，默认为 200
     * - data: 原始返回值，直接透传
     * - timestamp: ISO 格式时间戳
     *
     * 为什么使用 map：
     * - rxjs 的 map 操作符用于转换 Observable 发出的值
     * - 在数据发送给客户端之前进行转换
     */
    return next.handle().pipe(
      map((data) => ({
        /**
         * 响应状态码
         * @description HTTP 状态码
         * - 从 response.statusCode 读取
         * - 默认为 200（成功）
         * - 可能是 201（创建）、204（无内容）等
         */
        statusCode: response.statusCode || 200,

        /**
         * 响应数据
         * @description 原始返回值
         * - Controller 返回的数据
         * - 可能是任何类型：对象、数组、字符串等
         */
        data,

        /**
         * 时间戳
         * @description 响应生成时间
         * - ISO 8601 格式
         * - 便于客户端和日志系统使用
         */
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
