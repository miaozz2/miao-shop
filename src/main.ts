/**
 * 应用入口模块
 *
 * 为什么需要入口模块：
 * - 负责启动 NestJS 应用
 * - 配置全局中间件和管道
 *
 * 主要功能：
 * 1. 创建应用实例
 * 2. 配置 CORS（跨域资源共享）
 * 3. 配置全局验证管道
 * 4. 设置全局路由前缀
 *
 * 关联性：
 * - 导入 AppModule 作为根模块
 * - CORS 配置允许前端应用跨域调用 API
 * - ValidationPipe 全局拦截请求进行 DTO 验证
 */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '@/app.module';
import { HttpExceptionFilter } from '@/core/filters/http-exception.filter';
import { SuccessInterceptor } from '@/core/interceptors/success.interceptor';
import { networkInterfaces } from 'os';

/**
 * 启动应用
 *
 * @description 创建 NestJS 应用实例并启动 HTTP 服务器
 *
 * 启动流程：
 * 1. NestFactory.create() 创建应用实例
 * 2. enableCors() 启用跨域支持
 * 3. useGlobalPipes() 注册全局验证管道
 * 4. setGlobalPrefix() 设置 API 前缀为 /api
 * 5. listen() 启动服务器监听指定端口
 *
 * @returns Promise<void> - 服务器启动完成
 */
async function bootstrap(): Promise<void> {
  /**
   * 创建应用实例
   * @description NestFactory.create() 是标准应用创建方式
   * - 自动初始化依赖注入容器
   * - 注册中间件、守卫、拦截器等
   */
  const app = await NestFactory.create(AppModule);

  /**
   * 启用 CORS
   * @description 允许前端应用跨域调用 API
   * - 开发环境必需（前后端分离架构）
   * - 生产环境可根据需求配置具体允许的域名
   */
  app.enableCors();

  /**
   * 注册全局验证管道
   * @description ValidationPipe 用于自动验证请求数据
   *
   * 配置项：
   * - whitelist: true - 移除不在 DTO 定义中的属性
   * - transform: true - 自动转换请求数据到正确类型
   */
  app.useGlobalPipes(
    new ValidationPipe({
      /**
       * whitelist: true
       * 为什么要这样：自动剔除 DTO 中没有用 @Prop() 定义的字段
       * 场景：用户 POST { name: "xx", password: "xxx" } 但 DTO 只有 name
       * 结果：password 被剔除，不会进入业务逻辑，防止恶意附加字段
       */
      whitelist: true,

      /**
       * forbidNonWhitelisted: false（默认）
       * 为什么要 false：whitelist 已剔除多余字段，额外报错没有必要
       * 场景：前端传了临时字段 tempAge，只会被静默忽略，不会 400
       * true 的场景：严格模式，不允许任何 DTO 之外的字段传入
       */
      forbidNonWhitelisted: false,

      /**
       * transform: true
       * 为什么要这样：HTTP 传过来的数据都是字符串，但 DTO 定义了 number/boolean 类型
       * 场景：{ id: "1", completed: "true" } → 自动转为 { id: 1, completed: true }
       * 免去手动转换的麻烦
       */
      transform: true,
    }),
  );

  /**
   * 设置全局路由前缀
   * @description 所有路由都会添加 /api 前缀
   * - 例如 /auth/login 变为 /api/auth/login
   * - 便于nginx反向代理和API版本管理
   */
  app.setGlobalPrefix('api');

  /**
   * 注册全局异常过滤器
   * @description 统一错误格式
   */
  app.useGlobalFilters(new HttpExceptionFilter());

  /**
   * 注册全局响应拦截器
   * @description 统一成功响应格式
   */
  app.useGlobalInterceptors(new SuccessInterceptor());

  /**
   * 获取端口并启动服务器
   * @description 从环境变量 PORT 读取端口，默认为 3000
   * - 使用 ?? 而非 || 避免将 0、空字符串视为无效值
   */
  const port = process.env.PORT ?? 3000;
  // 启动服务器并监听端口
  // await 确保服务器真正启动后再输出日志
  await app.listen(port, () => {
    const localUrl = `http://localhost:${port}/`;
    const ips = getLocalIPv4Addresses();

    console.log('');
    console.log('  🚀 Express App running at:');
    console.log(`  📍 Local:   ${localUrl}`);
    if (ips.length) {
      // 可能有多个网卡/地址，逐个列出
      for (const ip of ips) {
        console.log(`  🌐 Network: ${`http://${ip}:${port}/`}`);
      }
    } else {
      console.log('  ⚠️  Network: (no network interface detected)');
    }
  });
}

/**
 * 启动引导
 * @description 使用 catch 处理启动错误，防止应用静默崩溃
 * - 捕获启动过程中的异常
 * - 输出错误日志
 * - 以非零状态码退出
 */
bootstrap().catch((err: Error): void => {
  console.error('启动失败:', err);
  process.exit(1);
});

/**
 * 获取本机 IPv4 地址列表
 *
 * 为什么要这样实现：
 * - Node.js 不直接提供获取本机 IP 的 API，需要通过 os.networkInterfaces() 遍历
 * - 只返回 IPv4 (family === 'IPv4') 且非内部地址 (internal === false)
 * - 内部地址如 127.0.0.1 不返回，因为用户通常需要的是可被外部访问的地址
 */
function getLocalIPv4Addresses(): string[] {
  const nets = networkInterfaces();
  const ips: string[] = [];

  for (const name in nets) {
    const interfaces = nets[name];
    if (!interfaces) continue;

    for (const net of interfaces) {
      if (net.family === 'IPv4' && !net.internal) {
        ips.push(net.address);
      }
    }
  }

  return ips;
}
