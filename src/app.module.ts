import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

/**
 * 根模块：NestJS 应用的核心单元
 *
 * 为什么使用 @Module 装饰器：
 * - NestJS 基于模块化架构，每个功能模块独立注册
 * - @Module 接收 metadata 对象，声明该模块的控制器、服务等依赖
 * - 这种声明式设计让依赖关系可视化，便于管理大型应用
 *
 * imports 数组为空：
 * - 目前没有其他模块依赖（如 TypeORM、Redis 等）
 * - 随着项目扩展，在此注册数据库模块、认证模块等
 */
@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
