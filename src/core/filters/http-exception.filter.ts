/**
 * 全局异常过滤器
 *
 * 为什么需要统一错误格式：
 * - 所有接口返回一致的错误结构，便于前端处理
 * - 避免不同模块抛出不同格式的错误
 * - 与 ApiResponse.success() 格式对应
 *
 * 错误格式：
 * ```json
 * {
 *   "code": 400,
 *   "message": "用户名已被使用",
 *   "error": "Bad Request"
 * }
 * ```
 *
 * 设计原则：
 * - 与成功响应格式保持一致的结构
 * - 成功：{ code: 200, data, message }
 * - 错误：{ code: 4xx/5xx, message, error }
 * - 客户端只需判断 code === 200 或 code !== 200
 *
 * 关联性：
 * - 在 main.ts 中通过 app.useGlobalFilters() 注册
 * - 所有 Controller 抛出的 HttpException 都会经过此过滤器
 * - 错误格式与 ApiResponse 类保持一致
 */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * @Catch() 装饰器
 * @description 声明 HttpExceptionFilter 为全局异常过滤器
 * - 捕获所有 HttpException 异常
 * - 将异常转换为统一的错误响应格式
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  /**
   * catch - 异常处理方法
   *
   * 为什么需要 catch：
   * - NestJS 异常过滤器必须实现的方法
   * - 当 Controller 抛出 HttpException 时调用
   *
   * @param exception - 抛出的异常对象
   * @param host - 执行上下文，包含请求和响应信息
   *
   * 流程：
   * 1. 获取 HTTP 响应对象
   * 2. 从异常中提取 status 和 message
   * 3. 返回统一格式的错误响应
   */
  catch(exception: unknown, host: ArgumentsHost) {
    /**
     * 获取 HTTP 上下文
     * @description 用于提取响应对象
     */
    const ctx = host.switchToHttp();

    /**
     * 获取响应对象
     * @description 用于发送错误响应
     */
    const response = ctx.getResponse<Response>();

    /**
     * 获取 HTTP 状态码
     * @description 从异常中提取状态码
     * - 如果是 HttpException：使用其 getStatus()
     * - 如果不是：默认 500（服务器内部错误）
     */
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    /**
     * 获取错误消息
     * @description 从异常中提取错误消息
     *
     * 消息来源优先级：
     * 1. HttpException.getResponse().message（自定义消息）
     * 2. HttpException.message（默认消息）
     * 3. 'Internal server error'（未知错误）
     *
     * 处理逻辑：
     * - 如果 message 是数组：.join(', ') 转为字符串
     * - 如果是对象：尝试提取 message 字段
     */
    const message =
      exception instanceof HttpException
        ? exception.getResponse() instanceof Object
          ? ((exception.getResponse() as any).message ?? exception.message)
          : exception.message
        : 'Internal server error';

    /**
     * 发送错误响应
     * @description 返回统一格式的错误响应
     *
     * 响应格式：
     * - code: HTTP 状态码（400/401/403/404/500 等）
     * - message: 错误消息（用户可见）
     * - error: 错误类型名称（用于调试）
     *
     * 注意：不包含 timestamp 和 path
     * - 这些信息对客户端不是必需的
     * - 可通过日志系统获取
     */
    response.status(status).json({
      /**
       * 错误码
       * @description HTTP 状态码
       * - 400: 参数错误
       * - 401: 未认证
       * - 403: 无权限
       * - 404: 资源不存在
       * - 500: 服务器错误
       */
      code: status,

      /**
       * 错误消息
       * @description 用户可见的错误描述
       * - 如果是数组：使用 join(', ') 合并
       */
      message: Array.isArray(message) ? message.join(', ') : message,

      /**
       * 错误类型
       * @description 错误类型名称（用于调试）
       * - HttpStatus[400] === 'Bad Request'
       * - HttpStatus[401] === 'Unauthorized'
       */
      error: HttpStatus[status] || 'Error',
    });
  }
}
