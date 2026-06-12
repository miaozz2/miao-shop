/**
 * AppController 单元测试
 *
 * 为什么需要单元测试：
 * - 验证控制器行为符合预期
 * - 防止代码修改破坏现有功能
 * - 提供代码文档作用
 *
 * 测试策略：
 * - 使用 NestJS Testing 模块
 * - Mock AppService
 * - 测试 getHello() 返回值
 */
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';

describe('AppController', () => {
  /**
   * 控制器实例
   * @description 用于测试的方法调用
   */
  let appController: AppController;

  /**
   * beforeEach - 测试前准备
   *
   * 为什么在 beforeEach 中创建 TestingModule：
   * - 每个测试需要独立的依赖注入容器
   * - 避免测试间状态污染
   *
   * 创建流程：
   * 1. Test.createTestingModule() 创建测试模块
   * 2. 声明控制器和服务
   * 3. compile() 编译模块
   * 4. get() 获取控制器实例
   */
  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    /**
     * 获取控制器实例
     * @description TestingModule.get() 从注入容器获取
     */
    appController = app.get<AppController>(AppController);
  });

  /**
   * describe('root') - 根路由测试
   *
   * @description 测试 GET / 返回值
   */
  describe('root', () => {
    /**
     * it('should return greeting') - 测试问候语
     *
     * 为什么测试返回值：
     * - 验证 getHello() 返回预期字符串
     * - 确保 AppService 被正确调用
     */
    it('should return "Hello 苗振振!"', () => {
      /**
       * expect(appController.getHello()).toBe()
       * @description 验证控制器调用服务返回的值
       */
      expect(appController.getHello()).toBe('Hello 苗振振!');
    });
  });
});
