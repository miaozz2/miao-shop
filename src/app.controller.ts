/**
 * 根控制器
 *
 * 为什么使用 @Controller() 而非 @RestController()：
 * - @Controller() 需要配合 @Get/@Post 等装饰器明确指定 HTTP 方法
 * - 比 @RestController 更灵活，适合需要自定义响应头等场景
 * - 当前项目无 REST API 需求，用 @Controller() 保持轻量
 *
 * 职责：
 * - 接收 HTTP 请求
 * - 调用 AppService 处理业务逻辑
 * - 返回响应
 *
 * 关联性：
 * - 依赖注入 AppService
 * - 被 AppModule 注册
 */
import { Controller, Get } from '@nestjs/common';
import { AppService } from '@/app.service';

/**
 * @Controller() 装饰器
 * @description 声明 AppController 为 NestJS 控制器
 * - 处理 HTTP 请求
 * - 路由前缀为空（根路由）
 */
@Controller()
export class AppController {
  /**
   * 构造函数注入
   * @param appService - 应用服务实例
   *
   * 为什么使用构造函数注入：
   * - NestJS 推荐的依赖注入方式
   * - 便于单元测试时 mock
   * - 业务逻辑不写在控制器层
   */
  constructor(private readonly appService: AppService) {}

  /**
   * GET / — 返回问候语
   *
   * @returns string - HTTP 响应体
   *
   * 为什么使用 @Get() 装饰器：
   * - 声明这是处理 GET 请求的方法
   * - 路由为 "/"
   * - NestJS 自动处理路由注册
   *
   * 返回值：
   * - 调用 appService.getHello() 获取问候语
   * - NestJS 将返回值作为 HTTP 响应体
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}