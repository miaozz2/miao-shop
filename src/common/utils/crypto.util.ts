/**
 * AES 加密/解密工具
 *
 * 为什么单独作为工具类：
 * - 提取签名守卫中的加密逻辑，便于复用
 * - 集中管理 AES 密钥和 IV
 *
 * 依赖：
 * - crypto-js 用于 AES 加解密
 * - ConfigService 读取 signature.* 配置
 */
import * as CryptoJS from 'crypto-js';
import { ConfigService } from '@nestjs/config';

export class CryptoUtil {
  private readonly aesKey: string;
  private readonly aesId: string;

  constructor(private readonly configService: ConfigService) {
    this.aesKey = this.configService.get<string>('signature.aesKey') ?? '';
    this.aesId = this.configService.get<string>('signature.aesId') ?? '';
  }

  /**
   * 解密
   * @param encryptedData - AES 加密字符串
   * @returns 解密后的原始字符串
   */
  decrypt(encryptedData: string): string {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, this.aesKey, {
      iv: CryptoJS.enc.Utf8.parse(this.aesId),
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  /**
   * 加密
   * @param data - 原始字符串
   * @returns AES 加密后的字符串
   */
  encrypt(data: string): string {
    return CryptoJS.AES.encrypt(data, this.aesKey, {
      iv: CryptoJS.enc.Utf8.parse(this.aesId),
    }).toString();
  }
}
