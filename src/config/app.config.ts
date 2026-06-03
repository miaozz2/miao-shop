/**
 * 应用配置
 *
 * 配置项：
 * - port: 服务器端口
 */
import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  port: parseInt(process.env.PORT ?? '', 10) || 3000,
}));
