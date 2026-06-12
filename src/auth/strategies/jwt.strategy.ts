/**
 * JWT 策略
 *
 * 为什么使用 Passport 的 Strategy：
 * - NestJS 官方推荐的认证方案
 * - 与 @nestjs/passport 和 @nestjs/jwt 配合良好
 * - 便于后续扩展第三方登录（OAuth）
 *
 * 工作流程：
 * 1. JwtAuthGuard 拦截请求，提取 Bearer Token
 * 2. 本策略验证 Token，获取 payload（userId, role）
 * 3. 将用户信息挂载到 request.user
 * 4. 后续 Guards 可从 request.user 获取用户信息
 *
 * 关联性：
 * - 被 auth.module.ts 的 providers 引入
 * - 被 JwtAuthGuard 隐式调用
 * - validate() 返回值挂载到 request.user
 */
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

/**
 * @Injectable() 装饰器
 * @description 声明 JwtStrategy 为 NestJS 可注入策略
 * - 继承自 Passport 的 Strategy
 * - 用于验证 JWT Token
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  /**
   * 构造函数
   *
   * 为什么需要 ConfigService：
   * - JWT 密钥从配置读取（生产环境使用强密钥）
   * - 避免将密钥硬编码在代码中
   *
   * super() 调用：
   * - 传递配置给父类（passport-jwt 的 Strategy）
   * - 配置项说明：
   *   - jwtFromRequest: 如何从请求提取 Token
   *   - ignoreExpiration: 是否忽略过期（false 由我们控制更清晰）
   *   - secretOrKey: 验证签名的密钥
   *
   * @param configService - 配置服务实例
   */
  constructor(private readonly configService: ConfigService) {
    super({
      /**
       * 从请求头提取 Token
       * @description 使用 fromAuthHeaderAsBearerToken() 从 Authorization 头提取
       * - 格式：Authorization: Bearer <token>
       * - 自动处理 Bearer 前缀
       */
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      /**
       * 忽略过期
       * @description 设置为 false 由 Guard 处理更清晰
       * - true: Token 过期也通过验证
       * - false: Token 过期时验证失败
       */
      ignoreExpiration: false,

      /**
       * JWT 签名密钥
       * @description 从环境变量读取
       * - 用于验证 Token 签名是否有效
       */
      secretOrKey: configService.get<string>('jwt.secret') ?? 'default-secret',
    });
  }

  /**
   * validate - 验证通过后的回调
   *
   * 为什么需要 validate：
   * - Token 验证通过后调用此方法
   * - 提取 payload 中的用户信息
   * - 返回值挂载到 request.user
   *
   * @param payload - Token 解码后的 payload
   * @returns 挂载到 request.user 的用户信息
   *
   * payload 结构：
   * - userId: 用户 ID
   * - role: 用户角色
   *
   * 关联性：
   * - request.user 用于 RolesGuard 获取用户角色
   * - JwtAuthGuard.handleRequest() 返回此值
   */
  validate(payload: { userId: number; role: string }) {
    return { userId: payload.userId, role: payload.role };
  }
}
