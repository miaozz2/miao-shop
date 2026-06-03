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
 * 关联性：
 * - 被 AppModule 导入
 * - 导出 UserService 给 AuthModule 使用
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/user/entities/user.entity';
import { UserService } from '@/user/user.service';
import { UserController } from '@/user/user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],

  controllers: [UserController],

  providers: [UserService],

  exports: [UserService],
})
export class UserModule {}
