/**
 * 根模块
 *
 * 为什么使用 @Module 装饰器：
 * - NestJS 基于模块化架构，每个功能模块独立注册
 * - @Module 接收 metadata 对象，声明该模块的控制器、服务等依赖
 * - 这种声明式设计让依赖关系可视化，便于管理大型应用
 *
 * 模块职责：
 * - ConfigModule: 加载环境变量，isGlobal=true 全局可用
 * - DatabaseModule: 连接 PostgreSQL 数据库
 * - AuthModule: 处理用户认证
 * - UserModule: 处理用户数据
 * - LogsModule: 记录操作日志
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@/database/database.module';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { AuthModule } from '@/auth/auth.module';
import { UserModule } from '@/user/user.module';
import { LogsModule } from '@/logger/logs.module';
import {
  appConfig,
  jwtConfig,
  bcryptConfig,
  signatureConfig,
  databaseConfig,
  envValidationSchema,
} from '@/config';

@Module({
  imports: [
    /**
     * 配置模块
     * @description 加载 .env 文件中的环境变量到 process.env
     * - isGlobal: true - 全局可用，其他模块无需重复导入
     * - load: 加载各域配置定义
     * - validationSchema: 启动时验证环境变量
     */
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, jwtConfig, bcryptConfig, signatureConfig, databaseConfig],
      validationSchema: envValidationSchema,
    }),

    /**
     * 数据库模块
     * @description 连接 PostgreSQL 数据库
     * - autoLoadEntities: true - 自动加载 Entity，无需手动注册
     * - synchronize: true - 开发环境自动同步 schema
     */
    DatabaseModule,

    /**
     * 功能模块
     * @description 导入业务模块
     * - AuthModule - 认证模块（注册、登录、JWT）
     * - UserModule - 用户模块（用户数据）
     * - LogsModule - 日志模块（操作记录）
     */
    AuthModule,
    UserModule,
    LogsModule,
  ],

  /**
   * 控制器
   * @description 注册控制器到模块
   * - AppController 处理根路由 "/"
   */
  controllers: [AppController],

  /**
   * 服务提供者
   * @description 注册服务到模块
   * - AppService 提供 getHello() 方法
   */
  providers: [AppService],
})
export class AppModule {}
