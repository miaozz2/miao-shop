/**
 * 认证控制器
 *
 * 为什么使用 @Controller('auth')：
 * - 路由前缀 /auth
 * - 处理所有认证相关 HTTP 请求
 *
 * 接口列表：
 * - POST /auth/register - 用户注册
 * - POST /auth/login - 用户登录
 * - POST /auth/refresh - 刷新 Token
 *
 * 关联性：
 * - 被 auth.module.ts 注册
 * - 调用 auth.service.ts 处理业务逻辑
 */
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from '@/auth/auth.service';
import { RegisterDto } from '@/auth/dto/register.dto';
import { LoginDto } from '@/auth/dto/login.dto';

/**
 * @Controller('auth') 装饰器
 * @description 声明 AuthController 为 NestJS 控制器
 * - 路由前缀：/auth
 * - 处理认证相关请求
 */
@Controller('auth')
export class AuthController {
  /**
   * 构造函数
   *
   * 为什么使用构造函数注入：
   * - NestJS 推荐的依赖注入方式
   * - 控制器不应该包含业务逻辑，只负责请求/响应
   * - 业务逻辑委托给 Service 层
   *
   * @param authService - 认证服务实例
   * - 用于处理注册、登录、刷新 Token 等业务逻辑
   */
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/register - 用户注册
   *
   * @param dto - RegisterDto 注册数据
   * @returns 创建的用户信息
   *
   * 为什么无需认证：
   * - 注册是公开接口，任何人都可以调用
   * - 用于创建新用户账号
   */
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /**
   * POST /auth/login - 用户登录
   *
   * @param dto - LoginDto 登录数据
   * @returns { accessToken, refreshToken }
   *
   * 为什么无需认证：
   * - 登录是公开接口，需要先登录才能获取 Token
   *
   * 返回值说明：
   * - accessToken: 用于API请求认证，有效期15分钟
   * - refreshToken: 用于刷新 accessToken，有效期7天
   */
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /**
   * POST /auth/refresh - 刷新 Token
   *
   * @param refreshToken - refreshToken 字符串
   * @returns { accessToken, refreshToken }
   *
   * 为什么无需认证：
   * - 使用 refreshToken 来获取新的 accessToken
   * - refreshToken 本身也是一种认证凭证
   *
   * 使用场景：
   * - accessToken 过期后，用 refreshToken 获取新 Token
   * - 用户无需重新输入密码登录
   */
  @Post('refresh')
  refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refresh(refreshToken);
  }
}
