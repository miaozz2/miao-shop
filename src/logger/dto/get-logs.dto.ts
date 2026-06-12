/**
 * 查询日志 DTO
 *
 * 为什么使用 DTO（Data Transfer Object）：
 * - 定义日志查询请求的数据结构
 * - 配合 class-validator 自动验证请求参数
 * - 提供分页功能，避免一次性查询全部数据
 *
 * 查询参数：
 * - userId: 按用户 ID 筛选（可选）
 * - action: 按操作类型筛选（可选）
 * - page: 页码（默认 1）
 * - limit: 每页条数（默认 20）
 *
 * 验证规则：
 * - userId: 可选字符串
 * - action: 可选字符串
 * - page: 整数，最小值 0
 * - limit: 整数，最小值 1
 *
 * 关联性：
 * - 被 logs.controller.ts getLogs 方法使用
 * - 被 logs.service.ts findAll 方法处理
 */
import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * GetLogsDto 类
 * @description 日志查询请求参数
 *
 * @example
 * // 查询第 1 页，每页 20 条
 * { page: 1, limit: 20 }
 *
 * // 按用户 ID 筛选
 * { userId: '123', page: 1, limit: 20 }
 */
export class GetLogsDto {
  /**
   * 用户 ID
   * @description 按用户 ID 筛选日志
   * - 可选，不传则返回所有用户的日志
   */
  @IsOptional()
  @IsString()
  userId?: string;

  /**
   * 操作类型
   * @description 按操作类型筛选日志
   * - 可选，格式如 "POST:/api/auth/login"
   */
  @IsOptional()
  @IsString()
  action?: string;

  /**
   * 页码
   * @description 分页查询的页码
   * - 默认 1
   * - 最小值 0
   * - Transform 将字符串转为数字
   */
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(0)
  page?: number = 1;

  /**
   * 每页条数
   * @description 每页返回的日志数量
   * - 默认 20
   * - 最小值 1
   * - Transform 将字符串转为数字
   */
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
