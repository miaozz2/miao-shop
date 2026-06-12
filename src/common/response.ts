/**
 * API 统一响应包装类
 *
 * 为什么需要统一响应：
 * - 所有接口返回一致的结构，便于前端处理
 * - 类型安全，有 IDE 自动补全
 * - 便于日志、监控、错误追踪
 *
 * 设计原则：
 * - 成功响应：body.code 统一为 200，客户端只需判断 code === 200
 * - 错误响应：body.code 为具体错误码（400/401/403/500），客户端根据 code 提示
 *
 * 响应格式：
 * ```json
 * // 成功
 * {
 *   "code": 200,
 *   "data": { ... },
 *   "message": "操作成功"
 * }
 *
 * // 错误
 * {
 *   "code": 400,
 *   "message": "参数错误",
 *   "error": "Validation failed"
 * }
 * ```
 *
 * 使用方式：
 * - Controller 返回 ApiResponse.success(data, message)
 * - SuccessInterceptor 自动检测并转换
 * - 错误通过 HttpException 自动处理
 */
export class ApiResponse<T> {
  /**
   * 响应状态码
   * @description 业务状态码，用于客户端判断成功/失败
   * - 200: 成功
   * - 400: 参数错误
   * - 401: 未认证
   * - 403: 无权限
   * - 404: 资源不存在
   * - 500: 服务器错误
   *
   * 注意：此 code 是 body 中的业务状态码，不是 HTTP 状态码
   * HTTP 状态码由 NestJS 框架自动设置
   */
  code: number;

  /**
   * 响应数据
   * @description 接口返回的业务数据
   * - 可能是任何类型：对象、数组、字符串等
   * - 如果是分页数据，可包含 total、page 等字段
   */
  data: T;

  /**
   * 响应消息
   * @description 操作结果的描述信息
   * - 用于告诉调用者操作结果
   * - 如 "登录成功"、"注册成功"、"删除成功"
   */
  message: string;

  /**
   * 错误信息（仅错误响应）
   * @description 详细的错误信息，用于调试
   * - 仅在 code !== 200 时有意义
   */
  error?: string;

  /**
   * 构造函数
   * @param code - 业务状态码
   * @param data - 响应数据
   * @param message - 响应消息
   * @param error - 错误信息（可选）
   */
  constructor(code: number, data: T, message: string, error?: string) {
    this.code = code;
    this.data = data;
    this.message = message;
    if (error) {
      this.error = error;
    }
  }

  /**
   * 创建成功响应
   *
   * @param data - 响应数据
   * @param message - 成功消息，默认 "操作成功"
   * @returns ApiResponse 实例
   *
   * @example
   * // 简单成功响应
   * return ApiResponse.success({ id: 1 });
   *
   * // 带自定义消息
   * return ApiResponse.success(user, '登录成功');
   */
  static success<T>(data: T, message = '操作成功'): ApiResponse<T> {
    return new ApiResponse<T>(200, data, message);
  }

  /**
   * 创建创建成功响应
   *
   * @param data - 响应数据
   * @param message - 成功消息，默认 "创建成功"
   * @returns ApiResponse 实例
   *
   * @example
   * return ApiResponse.created(user, '用户创建成功');
   */
  static created<T>(data: T, message = '创建成功'): ApiResponse<T> {
    return new ApiResponse<T>(200, data, message);
  }

  /**
   * 创建无内容响应
   *
   * @param message - 成功消息，默认 "操作成功"
   * @returns ApiResponse 实例
   *
   * @example
   * return ApiResponse.noContent('删除成功');
   */
  static noContent(message = '操作成功'): ApiResponse<null> {
    return new ApiResponse<null>(200, null, message);
  }

  /**
   * 创建错误响应
   *
   * @param code - 错误码（400/401/403/404/500）
   * @param message - 错误消息
   * @param error - 详细错误信息（可选）
   * @returns ApiResponse 实例
   *
   * @example
   * return ApiResponse.error(400, '参数错误', 'username 不能为空');
   */
  static error(
    code: number,
    message: string,
    error?: string,
  ): ApiResponse<null> {
    return new ApiResponse<null>(code, null, message, error);
  }
}
