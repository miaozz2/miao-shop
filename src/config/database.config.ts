/**
 * 数据库连接配置
 *
 * 配置项：
 * - host: 数据库主机
 * - port: 数据库端口
 * - username: 数据库用户名
 * - password: 数据库密码
 * - name: 数据库名称
 */
import { registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', () => ({
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT ?? '', 10) || 5432,
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  name: process.env.DATABASE_NAME || 'miao_shop',
}));
