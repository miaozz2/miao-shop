/**
 * 日志控制器
 *
 * 提供日志查询接口（仅管理员）
 */
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { LogsService } from '@/logger/logs.service';
import { GetLogsDto } from '@/logger/dto/get-logs.dto';
import { JwtAuthGuard } from '@/core/guards/jwt-auth.guard';
import { RolesGuard } from '@/core/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';

@Controller('logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  async getLogs(@Query() query: GetLogsDto) {
    return this.logsService.findAll(query);
  }
}
