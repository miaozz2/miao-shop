/**
 * @UseSignature() 装饰器
 *
 * 为什么要自定义装饰器：
 * - 标记需要签名验证的路由
 * - 配合 SignatureGuard 实现防重放攻击
 *
 * 使用方式：
 * @UseGuards(JwtAuthGuard, SignatureGuard)
 * @UseSignature()
 * @Post('some-protected-route')
 */
import { SetMetadata } from '@nestjs/common';

export const USE_SIGNATURE_KEY = 'use-signature';
export const UseSignature = () => SetMetadata(USE_SIGNATURE_KEY, true);
