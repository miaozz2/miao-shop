/**
 * 数据库配置 — PostgreSQL 连接配置
 *
 * 配置来源：
 * - 所有配置从环境变量读取，支持不同环境使用不同配置
 * - 使用 registerAs 将配置注册为命名空间配置
 *
 * 配置项说明：
 * | 环境变量              | 默认值     | 说明                    |
 * |---------------------|----------|------------------------|
 * | DATABASE_HOST       | localhost | 数据库服务器地址          |
 * | DATABASE_PORT       | 5432      | PostgreSQL 默认端口      |
 * | DATABASE_USERNAME   | postgres  | 数据库用户名             |
 * | DATABASE_PASSWORD   | postgres  | 数据库密码               |
 * | DATABASE_NAME       | miao_shop | 数据库名                 |
 * | DATABASE_SYNCHRONIZE| false     | 自动同步表结构            |
 * | DATABASE_LOGGING    | false     | SQL 日志输出             |
 *
 * synchronize 策略：
 * - 开发环境：true，自动同步表结构
 * - 生产环境：false，使用迁移脚本管理表结构
 *
 * logging 策略：
 * - 开发环境：true，输出 SQL 日志便于调试
 * - 生产环境：false，关闭 SQL 日志减少开销
 */

import { registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', () => ({
  /**
   * 数据库主机地址
   * - 开发环境通常是 localhost
   * - 生产环境是数据库服务器的 IP 或域名
   */
  host: process.env.DATABASE_HOST || 'localhost',

  /**
   * 数据库端口
   * - PostgreSQL 默认 5432
   * - parseInt 确保转换为数字类型
   */
  port: parseInt(process.env.DATABASE_PORT ?? '', 10) || 5432,

  /**
   * 数据库用户名
   * - PostgreSQL 默认超级用户是 postgres
   * - 生产环境建议创建专用用户
   */
  username: process.env.DATABASE_USERNAME || 'postgres',

  /**
   * 数据库密码
   * - 生产环境必须设置复杂密码
   * - 默认 postgres（仅用于开发）
   */
  password: process.env.DATABASE_PASSWORD || 'postgres',

  /**
   * 数据库名称
   * - 需提前在 PostgreSQL 中创建
   * - 开发环境建议使用独立数据库
   */
  name: process.env.DATABASE_NAME || 'miao_shop',

  /**
   * 自动同步表结构（开发用）
   * - true：Entity 字段变化时自动 ALTER 表结构
   * - false：使用迁移脚本管理表结构变更
   * - ⚠️ 生产环境必须 false，防止数据丢失
   */
  synchronize: process.env.DATABASE_SYNCHRONIZE === 'true',

  /**
   * SQL 日志输出
   * - true：输出执行的 SQL 语句
   * - false：关闭日志，减少性能开销
   */
  logging: process.env.DATABASE_LOGGING === 'true',
}));
