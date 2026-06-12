/**
 * 登录 DTO
 *
 * 为什么使用 DTO（Data Transfer Object）：
 * - 定义请求数据结构
 * - 配合 class-validator 自动验证请求参数
 * - 提供清晰的接口文档
 *
 * 验证规则：
 * - username: 非空字符串
 * - password: 非空字符串
 *
 * 关联性：
 * - 被 auth.controller.ts login 方法使用
 * - 被 auth.service.ts login 方法处理
 */
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * LoginDto 类
 * @description 用户登录请求数据结构
 *
 * @example
 * {
 *   username: 'john',
 *   password: '123456'
 * }
 */
export class LoginDto {
  /**
   * 用户名
   * @description 用户登录凭证
   * - 不能为空
   */
  @IsString()
  @IsNotEmpty({ message: '用户名不能为空' })
  username!: string;

  /**
   * 密码
   * @description 用户密码
   * - 不能为空
   */
  @IsString()
  @IsNotEmpty({ message: '密码不能为空' })
  password!: string;
}
