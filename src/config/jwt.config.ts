/**
 * JWT 配置 — Token 签发和验证参数
 *
 * 配置来源：
 * - 所有配置从环境变量读取，支持不同环境使用不同配置
 * - 使用 registerAs 将配置注册为命名空间配置
 *
 * 配置项说明：
 * | 环境变量              | 默认值  | 说明                    |
 * |---------------------|-------|------------------------|
 * | JWT_SECRET          | -     | 签名密钥（必填）         |
 * | JWT_EXPIRES_IN      | 15m   | Access Token 过期时间   |
 * | JWT_REFRESH_EXPIRES_IN | 7d | Refresh Token 过期时间  |
 *
 * Token 说明：
 * - Access Token：短期 token，用于 API 认证，有效期短（如 15m）
 * - Refresh Token：长期 token，用于刷新 Access Token，有效期长（如 7d）
 *
 * 安全建议：
 * - JWT_SECRET 必须使用强随机字符串（32+ 字符 hex）
 * - 生成命令：node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 */

import { registerAs } from '@nestjs/config';

export const jwtConfig = registerAs('jwt', () => ({
  /**
   * JWT 签名密钥
   * - 用于签发和验证 JWT Token
   * - 必须与 JWT_SECRET 环境变量一致
   * - ⚠️ 生产环境必须设置强随机密钥
   */
  secret: process.env.JWT_SECRET,

  /**
   * Access Token 过期时间
   * - JWT accessToken 的有效时长
   * - 格式：数字 + 单位（s/m/h/d）
   * - 示例：15m(15分钟)、1h(1小时)、7d(7天)
   */
  expiresIn: process.env.JWT_EXPIRES_IN || '15m',

  /**
   * Refresh Token 过期时间
   * - 用于刷新过期的 accessToken
   * - 建议比 expiresIn 长很多（如 7d 或 30d）
   */
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
}));
