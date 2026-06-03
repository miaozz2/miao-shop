/**
 * bcrypt 配置
 *
 * 配置项：
 * - saltRounds: bcrypt 盐轮数，默认 10
 */
import { registerAs } from '@nestjs/config';

export const bcryptConfig = registerAs('bcrypt', () => ({
  saltRounds: 10,
}));
