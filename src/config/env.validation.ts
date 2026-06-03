/**
 * 环境变量验证 Schema
 *
 * 为什么使用 Joi：
 * - 启动时验证所有环境变量是否符合预期
 * - 缺少必填配置时立即报错，而非运行到一半才发现
 * - 提供清晰的错误信息指出哪个变量缺失或类型错误
 */
import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  PORT: Joi.number().default(3000),
  AES_KEY: Joi.string().required(),
  AES_ID: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
  DATABASE_HOST: Joi.string().default('localhost'),
  DATABASE_PORT: Joi.number().default(5432),
  DATABASE_USERNAME: Joi.string().default('postgres'),
  DATABASE_PASSWORD: Joi.string().default('postgres'),
  DATABASE_NAME: Joi.string().required(),
});
