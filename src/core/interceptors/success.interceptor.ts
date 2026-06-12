/**
 * 全局响应拦截器
 *
 * 为什么需要统一响应格式：
 * - 所有接口返回一致的成功结构
 * - 统一包装 data、code、message
 *
 * 设计原则：
 * - 成功响应：body.code 统一为 200，客户端只需判断 code === 200
 * - 错误响应：body.code 为具体错误码（400/401/403/500），客户端根据 code 提示
 *
 * 成功格式：
 * ```json
 * {
 *   "code": 200,
 *   "data": { ... },
 *   "message": "操作成功"
 * }
 * ```
 *
 * 工作原理：
 * 1. 拦截所有响应
 * 2. 检测返回值是否为 ApiResponse 实例
 * 3. 如果是 ApiResponse：直接使用其属性
 * 4. 如果不是：包装为统一格式，body.code 强制为 200
 *
 * 关联性：
 * - 在 main.ts 中通过 app.useGlobalInterceptors() 注册
 * - 所有 Controller 的返回值都会经过此拦截器
 * - ApiResponse 类提供统一的响应包装
 */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '@/common/response';

/**
 * @Injectable() 装饰器
 * @description 声明 SuccessInterceptor 为 NestJS 可注入拦截器
 * - 实现 NestInterceptor 接口
 * - 用于拦截和转换响应数据
 */
@Injectable()
export class SuccessInterceptor<T> implements NestInterceptor<
  T,
  { code: number; data: T; message: string }
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
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<{ code: number; data: T; message: string }> {
    /**
     * 转换响应数据
     * @description 使用 pipe + map 将原始数据转换为统一格式
     *
     * 转换逻辑：
     * - 如果是 ApiResponse 实例：直接使用其属性
     * - 如果不是：使用默认值包装，code 强制为 200
     * - code: 成功统一为 200，错误由 HttpExceptionFilter 处理
     * - message: 从 ApiResponse 或默认值读取
     * - data: 从 ApiResponse 或原始返回值获取
     *
     * 为什么使用 map：
     * - rxjs 的 map 操作符用于转换 Observable 发出的值
     * - 在数据发送给客户端之前进行转换
     */
    return next.handle().pipe(
      map((result) => {
        /**
         * 检测 ApiResponse
         * @description 判断返回值是否是 ApiResponse 实例
         * - 使用 instanceof 检测
         * - ApiResponse 是用户自定义类，具有类型信息
         */
        if (result instanceof ApiResponse) {
          /**
           * 是 ApiResponse 实例
           * @description 直接使用其属性
           * - code: ApiResponse 的状态码（成功为 200）
           * - data: ApiResponse 的数据
           * - message: ApiResponse 的消息
           */
          return {
            code: result.code,
            data: result.data,
            message: result.message,
          };
        }

        /**
         * 不是 ApiResponse 实例
         * @description 使用默认值包装
         * - code: 统一为 200，不使用 HTTP 状态码
         * - message: 默认为 "操作成功"
         * - data: 原始返回值直接透传
         *
         * 注意：即使 HTTP 状态码是 201/204，body.code 仍为 200
         * 这样客户端只需判断 code === 200 即可
         */
        return {
          code: 200,
          message: '操作成功',
          data: result,
        };
      }),
    );
  }
}
