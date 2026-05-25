import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * 根控制器：处理根路由 "/" 的 HTTP 请求
 *
 * 使用 @Controller() 而非 @RestController：
 * - @Controller() 需要配合 @Get/@Post 等装饰器明确指定 HTTP 方法
 * - 比 @RestController 更灵活，适合需要自定义响应头的场景
 * - 当前项目无 REST API 需求，先用 @Controller() 保持轻量
 *
 * 依赖注入 AppService：
 * - 控制器不应包含业务逻辑，职责是接收请求、调用服务、返回响应
 * - 这样的分离使得业务逻辑可独立测试，也便于后续替换实现
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * GET / — 返回问候语
   *
   * 使用 @Get() 装饰器而非手动定义路由：
   * - 装饰器方式让路由与处理函数紧耦合，代码更易读
   * - NestJS 自动处理路由注册和参数验证
   *
   * 返回类型 string：
   * - 显式声明返回类型便于类型检查和文档生成
   * - NestJS 会将此作为 HTTP 响应体返回
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
