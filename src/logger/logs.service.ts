/**
 * 日志服务
 *
 * 提供操作日志的 CRUD 功能
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActionLog } from '@/logger/entities/action-log.entity';
import { GetLogsDto } from '@/logger/dto/get-logs.dto';

@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(ActionLog)
    private readonly actionLogRepository: Repository<ActionLog>,
  ) {}

  async create(data: Partial<ActionLog>): Promise<ActionLog> {
    return this.actionLogRepository.save(this.actionLogRepository.create(data));
  }

  async findAll(
    query: GetLogsDto,
  ): Promise<{ logs: ActionLog[]; total: number }> {
    const { userId, action, page = 1, limit = 20 } = query;
    const where: any = {};
    if (userId) where.userId = userId;
    if (action) where.action = action;

    const [logs, total] = await this.actionLogRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { logs, total };
  }
}
