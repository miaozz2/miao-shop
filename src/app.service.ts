import { Injectable } from '@nestjs/common';

/**
 * 根服务：包含应用的核心业务逻辑
 *
 * 为什么使用 @Injectable() 装饰器：
 * - 声明该类为 NestJS 依赖注入系统的服务提供者
 * - NestJS 会自动扫描并实例化带此装饰器的类
 * - 支持构造函数注入，方便进行单元测试时使用 mock
 *
 * 业务逻辑简洁的原因：
 * - 当前功能仅为返回静态问候语，无需复杂逻辑
 * - 保持服务轻量，后续功能在此基础上扩展
 */
@Injectable()
export class AppService {
  /**
   * 获取问候语
   *
   * 为什么返回静态字符串而非方法参数：
   * - 当前是示例项目，固定的 "Hello World!" 作为占位符
   * - 后续可改为读取配置、数据库或国际化文件获取实际内容
   */
  getHello(): string {
    return 'Hello World!';
  }
}
