/**
 * 日志模块
 *
 * 包含组件：
 * - Controller: LogsController（查询日志）
 * - Service: LogsService（CRUD）
 * - Interceptor: RequestLogInterceptor（自动记录请求）
 * - Entity: ActionLog（数据模型）
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActionLog } from '@/logger/entities/action-log.entity';
import { LogsService } from '@/logger/logs.service';
import { LogsController } from '@/logger/logs.controller';
import { RequestLogInterceptor } from '@/logger/interceptors/request-log.interceptor';

@Module({
  imports: [TypeOrmModule.forFeature([ActionLog])],
  controllers: [LogsController],
  providers: [LogsService, RequestLogInterceptor],
  exports: [LogsService, RequestLogInterceptor],
})
export class LogsModule {}
