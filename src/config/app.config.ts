/**
 * 应用配置 — 服务端口和运行参数
 *
 * 配置来源：
 * - 从环境变量读取，支持通过环境变量覆盖默认值
 * - 使用 registerAs 将配置注册为命名空间配置
 *
 * 配置项说明：
 * | 环境变量 | 默认值 | 说明                    |
 * |---------|-------|------------------------|
 * | PORT    | 3000  | 服务器监听端口          |
 *
 * 使用示例：
 * - 开发环境：PORT=3000 npm run start:dev
 * - 生产环境：PORT=8080 npm run start:prod
 */

import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  /**
   * 服务器监听端口
   * - 应用在此端口接收 HTTP 请求
   * - 默认 3000，可通过环境变量覆盖
   * - 使用 ?? 而非 || 避免将 0 视为无效值
   */
  port: parseInt(process.env.PORT ?? '', 10) || 3000,
}));
