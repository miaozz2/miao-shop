/**
 * API 统一响应包装类
 *
 * 为什么需要统一响应：
 * - 所有接口返回一致的结构，便于前端处理
 * - 类型安全，有 IDE 自动补全
 * - 便于日志、监控、错误追踪
 *
 * 使用方式：
 * - Controller 返回 ApiResponse.success(data, message)
 * - SuccessInterceptor 自动检测并转换
 *
 * 响应格式：
 * ```json
 * {
 *   "code": 200,
 *   "data": { ... },
 *   "message": "操作成功"
 * }
 * ```
 *
 * 扩展方式：
 * - 继承 ApiResponse 实现分页响应、错误响应等
 * - 如 PaginatedResponse、ErrorResponse
 */
export class ApiResponse<T> {
  /**
   * 响应状态码
   * @description HTTP 状态码
   * - 200: 成功
   * - 201: 创建成功
   * - 204: 无内容
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
   * 构造函数
   * @param code - HTTP 状态码
   * @param data - 响应数据
   * @param message - 响应消息
   */
  constructor(code: number, data: T, message: string) {
    this.code = code;
    this.data = data;
    this.message = message;
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
   * 创建创建成功响应（201）
   *
   * @param data - 响应数据
   * @param message - 成功消息，默认 "创建成功"
   * @returns ApiResponse 实例
   *
   * @example
   * return ApiResponse.created(user, '用户创建成功');
   */
  static created<T>(data: T, message = '创建成功'): ApiResponse<T> {
    return new ApiResponse<T>(201, data, message);
  }

  /**
   * 创建无内容响应（204）
   *
   * @param message - 成功消息，默认 "操作成功"
   * @returns ApiResponse 实例
   *
   * @example
   * return ApiResponse.noContent('删除成功');
   */
  static noContent(message = '操作成功'): ApiResponse<null> {
    return new ApiResponse<null>(204, null, message);
  }
}