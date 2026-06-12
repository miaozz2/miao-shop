/**
 * 更新用户 DTO
 *
 * 为什么使用 DTO（Data Transfer Object）：
 * - 定义更新用户请求的数据结构
 * - 配合 class-validator 自动验证请求参数
 * - 所有字段可选，只更新传入的字段
 *
 * 验证规则：
 * - username: 可选字符串
 * - email: 可选有效邮箱
 * - phone: 可选字符串
 * - avatar: 可选字符串（头像 URL）
 * - role: 可选字符串（角色）
 *
 * 关联性：
 * - 被 user.controller.ts updateProfile 方法使用
 * - 被 user.service.ts update 方法处理
 */
import { IsString, IsOptional, IsEmail } from 'class-validator';

/**
 * UpdateUserDto 类
 * @description 更新用户请求数据结构
 *
 * @example
 * // 更新手机号
 * { phone: '13800138000' }
 *
 * // 更新头像
 * { avatar: 'https://example.com/new-avatar.jpg' }
 */
export class UpdateUserDto {
  /**
   * 用户名
   * @description 用户名（可选）
   * - 更新时需确保唯一性
   */
  @IsString()
  @IsOptional()
  username?: string;

  /**
   * 邮箱
   * @description 用户邮箱（可选）
   * - 必须为有效邮箱格式
   * - 更新时需确保唯一性
   */
  @IsEmail({}, { message: '邮箱格式不正确' })
  @IsOptional()
  email?: string;

  /**
   * 手机号
   * @description 用户手机号（可选）
   */
  @IsString()
  @IsOptional()
  phone?: string;

  /**
   * 头像
   * @description 用户头像 URL（可选）
   */
  @IsString()
  @IsOptional()
  avatar?: string;

  /**
   * 角色
   * @description 用户角色（可选）
   * - 如 'user' 或 'admin'
   * - 通常仅管理员可修改
   */
  @IsString()
  @IsOptional()
  role?: string;
}