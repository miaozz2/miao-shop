/**
 * 签名验证配置 — 防重放攻击（AES 加密）
 *
 * 配置来源：
 * - 所有配置从环境变量读取，支持不同环境使用不同配置
 * - 使用 registerAs 将配置注册为命名空间配置
 *
 * 配置项说明：
 * | 环境变量       | 默认值        | 说明                    |
 * |--------------|-------------|------------------------|
 * | AES_KEY      | -           | AES 加密密钥（必填）     |
 * | AES_ID       | -           | AES 初始向量 IV（必填）  |
 * | AES_TIMESTAMP_WINDOW | 300000 | 时间戳窗口（5分钟）     |
 *
 * 防重放攻击原理：
 * 1. 客户端使用 AES_KEY 和 AES_ID 对请求参数进行加密
 * 2. 生成签名 + 时间戳，防止请求被截获后重放
 * 3. 服务端验证时间戳是否在窗口内（如 5 分钟）
 * 4. 超出窗口的请求被视为无效，防止重放攻击
 *
 * 安全建议：
 * - AES_KEY 必须是 32 字符 base64 编码字符串
 * - AES_ID 必须正好 16 个字符
 * - 生成命令：node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
 */

import { registerAs } from '@nestjs/config';

export const signatureConfig = registerAs('signature', () => ({
  /**
   * AES 加密密钥
   * - 用于 SignatureGuard 的 AES 解密
   * - 必须是 32 字符 base64 编码字符串
   * - ⚠️ 生产环境必须修改，不能使用默认值
   */
  aesKey: process.env.AES_KEY,

  /**
   * AES 初始向量（IV）
   * - AES 加密的 IV 参数
   * - 必须正好 16 个字符
   * - ⚠️ 生产环境必须修改，不能使用默认值
   */
  aesId: process.env.AES_ID,

  /**
   * 时间戳窗口（毫秒）
   * - 超过此时间的请求被视为无效
   * - 默认 5 分钟（5 * 60 * 1000）
   * - 可根据业务需求调整
   */
  timestampWindow: 5 * 60 * 1000,
}));
