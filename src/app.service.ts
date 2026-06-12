/**
 * 应用服务
 *
 * 为什么使用 @Injectable() 装饰器：
 * - 声明该类为 NestJS 依赖注入系统的服务提供者
 * - NestJS 会自动扫描并实例化带此装饰器的类
 * - 支持构造函数注入，方便进行单元测试时使用 mock
 *
 * 当前职责：
 * - 提供 getHello() 方法返回问候语
 * - 作为基础服务被 AppController 调用
 *
 * 扩展方向：
 * - 后续可添加更多全局业务逻辑
 * - 如：获取系统配置、查询全局统计等
 */
import { Injectable } from '@nestjs/common';

/**
 * @Injectable() 装饰器
 * @description 声明 AppService 为 NestJS 可注入的服务
 * - NestJS 依赖注入容器会自动管理其实例
 * - 构造函数参数会自动注入依赖
 */
@Injectable()
export class AppService {
  /**
   * 获取问候语
   *
   * @returns string - 返回问候语字符串
   *
   * 为什么返回静态字符串：
   * - 当前是示例项目，固定的问候语作为占位符
   * - 后续可改为读取配置、数据库或国际化文件获取实际内容
   *
   * @example
   * const greeting = appService.getHello();
   * // 返回: "Hello 苗振振!"
   */
  getHello(): string {
    return 'Hello 苗振振!';
  }
}
