/**
 * 注册 DTO
 *
 * 为什么使用 DTO（Data Transfer Object）：
 * - 定义请求数据结构
 * - 配合 class-validator 自动验证请求参数
 * - 提供清晰的接口文档
 *
 * 验证规则：
 * - username: 非空字符串
 * - email: 有效邮箱格式
 * - password: 至少 6 位
 *
 * 关联性：
 * - 被 auth.controller.ts register 方法使用
 * - 被 auth.service.ts register 方法处理
 */
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

/**
 * RegisterDto 类
 * @description 用户注册请求数据结构
 *
 * @example
 * {
 *   username: 'john',
 *   email: 'john@example.com',
 *   password: '123456'
 * }
 */
export class RegisterDto {
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
   * - 注册时加密存储
   */
  @IsString()
  @MinLength(6, { message: '密码至少6位' })
  @IsNotEmpty({ message: '密码不能为空' })
  password!: string;
}