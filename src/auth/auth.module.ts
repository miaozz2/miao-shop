/**
 * 认证模块
 *
 * 为什么单独作为模块：
 * - 认证逻辑独立封装
 * - 便于后续扩展第三方登录
 * - 便于单独测试
 *
 * 模块组成：
 * - Controller: AuthController（处理 HTTP 请求）
 * - Service: AuthService（处理业务逻辑）
 * - Strategy: JwtStrategy（JWT 验证策略）
 * - Services: SignatureService（签名验证）
 * - Guards: JwtAuthGuard、RolesGuard、SignatureGuard（权限控制）
 *
 * 关联性：
 * - 导入 UserModule 获取用户服务
 * - 导入 JwtModule 提供 JWT 服务
 * - 导入 PassportModule 提供 Passport 策略支持
 * - 导出 Guards 给其他模块使用
 */
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from '@/auth/auth.controller';
import { AuthService } from '@/auth/auth.service';
import { JwtStrategy } from '@/auth/strategies/jwt.strategy';
import { SignatureService } from '@/auth/services/signature.service';
import { JwtAuthGuard } from '@/core/guards/jwt-auth.guard';
import { RolesGuard } from '@/core/guards/roles.guard';
import { SignatureGuard } from '@/core/guards/signature.guard';
import { UserModule } from '@/user/user.module';
import type { StringValue } from 'ms';

@Module({
  imports: [
    /**
     * 导入用户模块
     * @description 跨模块依赖
     * - AuthService 需要 UserService 进行用户验证
     * - 需要在 UserModule 中 exports UserService
     */
    UserModule,

    /**
     * Passport 模块
     * @description 提供 Passport 策略支持
     */
    PassportModule,

    /**
     * JWT 模块（异步注册）
     * @description 注册 JWT 服务
     *
     * 为什么使用 registerAsync：
     * - 需要从 ConfigService 读取配置
     * - 异步初始化配置
     */
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret') ?? 'default-secret',
        signOptions: {
          expiresIn: (configService.get<string>('jwt.expiresIn') ??
            '7d') as StringValue,
        },
      }),
      inject: [ConfigService],
    }),
  ],

  controllers: [AuthController],

  providers: [
    AuthService,
    JwtStrategy,
    SignatureService,
    JwtAuthGuard,
    RolesGuard,
    SignatureGuard,
  ],

  exports: [
    AuthService,
    JwtAuthGuard,
    RolesGuard,
    SignatureGuard,
    SignatureService,
  ],
})
export class AuthModule {}
