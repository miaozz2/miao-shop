/**
 * 签名验证配置（防重放攻击）
 *
 * 配置项：
 * - aesKey: AES 加密密钥
 * - aesId: AES 初始向量
 * - timestampWindow: 时间戳窗口（毫秒），默认 5 分钟
 */
import { registerAs } from '@nestjs/config';

export const signatureConfig = registerAs('signature', () => ({
  aesKey: process.env.AES_KEY,
  aesId: process.env.AES_ID,
  timestampWindow: 5 * 60 * 1000,
}));
