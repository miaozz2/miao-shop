/**
 * 签名校验守卫
 *
 * 为什么需要签名校验：
 * - 防止重放攻击（Replay Attack）
 * - 请求被截获后无法在有效期内重放
 *
 * 时效窗口：5 分钟（可配置）
 * - 超过窗口的请求会被拒绝
 *
 * 客户端签名流程：
 * ```javascript
 * import CryptoJS from 'crypto-js';
 * const timestamp = Date.now();
 * const signature = CryptoJS.AES.encrypt(
 *   timestamp.toString(),
 *   AES_KEY,
 *   AES_ID
 * ).toString();
 * // 发送 X-Signature 头
 * ```
 */
import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { SignatureService } from '@/auth/services/signature.service';

@Injectable()
export class SignatureGuard {
  constructor(private readonly signatureService: SignatureService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const signature = request.headers['x-signature'];

    this.signatureService.validateSignature(signature);
    return true;
  }
}
