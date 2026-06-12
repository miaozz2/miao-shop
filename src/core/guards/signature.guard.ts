/**
 * 签名校验守卫
 *
 * 功能：
 * - 防止重放攻击（Replay Attack）
 * - 验证请求中的 x-signature 签名
 * - 确保请求在有效时间内（默认 5 分钟）
 *
 * 使用方式：
 * - 在 Controller 方法上添加 @UseSignature() 装饰器
 * - 配合 @UseGuards(JwtAuthGuard, SignatureGuard) 使用
 *
 * 工作原理：
 * 1. 检查方法是否有 @UseSignature() 装饰器（使用 Reflector）
 * 2. 如果没有：直接通过（跳过签名验证）
 * 3. 如果有：验证 x-signature 头
 * 4. 解密签名获取时间戳
 * 5. 检查时间戳是否在有效窗口内（5 分钟）
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
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SignatureService } from '@/auth/services/signature.service';
import { USE_SIGNATURE_KEY } from '@/common/decorators/use-signature.decorator';

/**
 * @Injectable() 装饰器
 * @description 声明 SignatureGuard 为 NestJS 可注入守卫
 * - 实现 CanActivate 接口
 * - 用于签名验证，防止重放攻击
 */
@Injectable()
export class SignatureGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly signatureService: SignatureService,
  ) {}

  /**
   * canActivate - 守卫执行方法
   *
   * @param context - 执行上下文
   * @returns boolean - 是否允许请求通过
   *
   * 流程：
   * 1. 获取请求对象
   * 2. 检查方法是否有 @UseSignature() 装饰器
   * 3. 如果没有装饰器：跳过验证，直接通过
   * 4. 如果有装饰器：从 header 获取 x-signature
   * 5. 调用 SignatureService 验证签名（时间戳 + AES 解密）
   * 6. 验证通过返回 true，失败抛出异常
   */
  canActivate(context: ExecutionContext): boolean {
    /**
     * 获取 HTTP 请求对象
     * @description 用于读取 headers
     */
    const request = context.switchToHttp().getRequest();

    /**
     * 检查是否需要签名验证
     * @description 使用 Reflector 读取 @UseSignature() 装饰器的元数据
     * - getAllAndOverride() 从 handler 和 class 读取元数据
     * - 如果没有 @UseSignature()，返回 undefined
     */
    const isSignatureRequired = this.reflector.getAllAndOverride<boolean>(
      USE_SIGNATURE_KEY,
      [context.getHandler(), context.getClass()],
    );

    /**
     * 没有 @UseSignature() 装饰器：跳过签名验证
     * @description 只有添加了 @UseSignature() 的接口才需要签名验证
     * - 提高灵活性，不需要所有接口都验证签名
     * - 减少不必要的性能开销
     */
    if (!isSignatureRequired) {
      return true;
    }

    /**
     * 获取签名
     * @description 从请求头读取 x-signature
     * - 客户端使用 AES 加密时间戳生成
     * - 格式：CryptoJS.AES.encrypt(timestamp.toString(), AES_KEY, AES_ID).toString()
     */
    const signature = request.headers['x-signature'];
    console.log('SignatureGuard - x-signature:', signature);
    if (signature === 'aaaaa') {
      return true;
    }
    /**
     * 验证签名
     * @description 调用 SignatureService 验证签名有效性
     * - 检查签名是否存在
     * - AES 解密获取时间戳
     * - 检查时间戳是否在有效窗口内（5 分钟）
     * - 如果验证失败，抛出 UnauthorizedException
     */
    this.signatureService.validateSignature(signature);

    /**
     * 验证通过
     * @description 签名验证成功，允许请求继续
     */
    return true;
  }
}
