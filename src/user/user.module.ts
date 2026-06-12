/**
 * 用户模块
 *
 * 什么是 Module：
 * - NestJS 模块化架构的基础单元
 * - 集中管理相关的 Providers、Controllers、Imports
 *
 * 模块职责：
 * - 提供用户数据管理服务
 * - 处理用户相关 HTTP 请求
 *
 * 包含组件：
 * - Controller：UserController 处理 HTTP 请求
 * - Service：UserService 用户 CRUD
 * - Entity：User 数据模型
 *
 * 模块依赖：
 * - AuthModule：用于 @UseSignature() 装饰器，需要 SignatureService
 * - 通过 imports AuthModule 获取 SignatureService 依赖
 *
 * 关联性：
 * - 被 AppModule 导入
 * - 导出 UserService 给 AuthModule 使用
 * - 导入 AuthModule 获取 SignatureService（用于签名验证）
 */
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/user/entities/user.entity';
import { UserService } from '@/user/user.service';
import { UserController } from '@/user/user.controller';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [
    /**
     * 数据库实体
     * @description 注册 User 实体，使 Service 可注入 Repository<User>
     */
    TypeOrmModule.forFeature([User]),

    /**
     * 认证模块
     * @description 导入 AuthModule 以使用 @UseSignature() 装饰器
     * - AuthModule 导出 SignatureService
     * - UserController 的 @UseSignature() 需要 SignatureService
     *
     * 为什么需要 forwardRef：
     * - 解决循环依赖：UserModule imports AuthModule，AuthModule imports UserModule
     * - forwardRef() 延迟模块解析，避免在初始化时出现循环引用
     *
     * 为什么需要导入：
     * - @UseSignature() 需要 SignatureGuard
     * - SignatureGuard 依赖 SignatureService
     * - SignatureService 在 AuthModule 中定义和导出
     * - 通过 imports AuthModule，UserModule 可以使用 SignatureService
     */
    forwardRef(() => AuthModule),
  ],

  controllers: [UserController],

  providers: [UserService],

  exports: [UserService],
})
export class UserModule {}
