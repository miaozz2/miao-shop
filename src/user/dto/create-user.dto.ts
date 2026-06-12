/**
 * 创建用户 DTO
 *
 * 为什么使用 DTO（Data Transfer Object）：
 * - 定义创建用户请求的数据结构
 * - 配合 class-validator 自动验证请求参数
 * - 提供清晰的接口文档
 *
 * 验证规则：
 * - username: 非空字符串，必填
 * - email: 有效邮箱格式，必填
 * - password: 至少 6 位，必填
 * - phone: 可选字符串
 * - avatar: 可选字符串（头像 URL）
 *
 * 关联性：
 * - 被 user.service.ts create 方法使用
 * - 被 auth.service.ts register 方法调用
 */
import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';

/**
 * CreateUserDto 类
 * @description 创建用户请求数据结构
 *
 * @example
 * {
 *   username: 'john',
 *   email: 'john@example.com',
 *   password: '123456',
 *   phone: '13800138000',
 *   avatar: 'https://example.com/avatar.jpg'
 * }
 */
export class CreateUserDto {
  /**
   * 用户名
   * @description 用户登录凭证
   * - 不能为空
   * - 类型为字符串
   */
  @IsString()
  @IsNotEmpty({ message: '用户名不能为空' })
  username!: string;

  /**
   * 邮箱
   * @description 用户邮箱地址
   * - 必须为有效邮箱格式
   * - 用于注册和找回密码
   */
  @IsEmail({}, { message: '邮箱格式不正确' })
  @IsNotEmpty({ message: '邮箱不能为空' })
  email!: string;

  /**
   * 密码
   * @description 用户密码
   * - 至少 6 位
   * - bcrypt 加密存储
   */
  @IsString()
  @MinLength(6, { message: '密码至少6位' })
  @IsNotEmpty({ message: '密码不能为空' })
  password!: string;

  /**
   * 手机号
   * @description 用户手机号（可选）
   * - 字符串类型
   */
  @IsString()
  @IsOptional()
  phone?: string;

  /**
   * 头像
   * @description 用户头像 URL（可选）
   * - 字符串类型
   */
  @IsString()
  @IsOptional()
  avatar?: string;
}