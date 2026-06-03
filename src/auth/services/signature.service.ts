/**
 * 签名服务
 *
 * 为什么需要单独的服务：
 * - 封装签名验证逻辑，供 SignatureGuard 和其他组件复用
 * - 依赖 CryptoUtil 进行 AES 加解密
 * - 依赖 DateUtil 检查时间戳时效性
 *
 * 验证流程：
 * 1. 验证签名存在
 * 2. AES 解密获取时间戳
 * 3. 检查时间戳是否在窗口内（默认 5 分钟）
 */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CryptoUtil } from '@/common/utils/crypto.util';
import { DateUtil } from '@/common/utils/date.util';

@Injectable()
export class SignatureService {
  private readonly cryptoUtil: CryptoUtil;
  private readonly timestampWindow: number;

  constructor(private readonly configService: ConfigService) {
    this.cryptoUtil = new CryptoUtil(configService);
    this.timestampWindow =
      this.configService.get<number>('signature.timestampWindow') ??
      5 * 60 * 1000;
  }

  /**
   * 验证签名
   * @param signature - X-Signature 头值
   * @throws UnauthorizedException - 签名缺失、无效或已过期
   */
  validateSignature(signature: string): void {
    if (!signature) {
      throw new UnauthorizedException('缺少签名');
    }
    try {
      const decrypted = this.cryptoUtil.decrypt(signature);
      const timestamp = parseInt(decrypted, 10);
      if (!DateUtil.isWithinWindow(timestamp, this.timestampWindow)) {
        throw new UnauthorizedException('签名已过期');
      }
    } catch {
      throw new UnauthorizedException('签名无效');
    }
  }

  /**
   * 生成签名
   * @param timestamp - 时间戳
   * @returns AES 加密后的签名字符串
   */
  generateSignature(timestamp: number): string {
    return this.cryptoUtil.encrypt(timestamp.toString());
  }
}
