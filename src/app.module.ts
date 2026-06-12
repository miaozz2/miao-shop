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
import { RequestLogInterceptor } from '@/logger/interceptors/request-log.interceptor';
import {
  appConfig,
  jwtConfig,
  bcryptConfig,
  signatureConfig,
  databaseConfig,
  envValidationSchema,
} from '@/config';
import { APP_INTERCEPTOR } from '@nestjs/core';

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
      load: [
        appConfig,
        jwtConfig,
        bcryptConfig,
        signatureConfig,
        databaseConfig,
      ],
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
   *
   * 为什么使用 APP_INTERCEPTOR 注册全局拦截器：
   * - APP_INTERCEPTOR 是 NestJS 内置的 multi-provide token
   * - 使用 { provide: APP_INTERCEPTOR, useClass: RequestLogInterceptor } 注册
   * - 这样注册的拦截器会被 NestJS 依赖注入系统自动管理
   * - RequestLogInterceptor 的构造函数依赖 LogsService 会自动被注入
   *
   * 对比：在 main.ts 中注册需要手动获取服务实例
   * ```typescript
   * // main.ts 中注册（不推荐，因为需要手动获取服务）
   * const logsService = app.get(LogsService);
   * app.useGlobalInterceptors(new RequestLogInterceptor(logsService));
   * ```
   *
   * 在模块中注册（推荐）：
   * ```typescript
   * // 自动解析依赖，无需手动获取
   * { provide: APP_INTERCEPTOR, useClass: RequestLogInterceptor }
   * ```
   *
   * 注意：APP_INTERCEPTOR 是 multi-provide，意味着可以注册多个拦截器
   * 它们会按注册顺序执行，形成拦截器链
   */
  providers: [
    AppService,
    {
      /**
       * 提供者配置
       * @description 使用 APP_INTERCEPTOR token 注册全局拦截器
       *
       * @param provide - APP_INTERCEPTOR 是 NestJS 内置 token
       * - 用于注册全局拦截器
       * - NestJS 会自动将所有使用此 token 注册的拦截器应用到所有路由
       *
       * @param useClass - 要注册的拦截器类
       * - RequestLogInterceptor 会自动注入 LogsService
       * - 无需手动调用 app.get() 获取服务实例
       */
      provide: APP_INTERCEPTOR,
      useClass: RequestLogInterceptor,
    },
  ],
})
export class AppModule {}
