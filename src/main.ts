import { NestFactory } from '@nestjs/core';
import { networkInterfaces } from 'os';
import { AppModule } from './app.module';


/**
 * 应用入口：创建 NestJS 应用实例并启动 HTTP 服务器
 *
 * 使用 NestFactory.create() 而非直接实例化 AppModule：
 * - NestFactory 提供标准化的应用创建流程，包含依赖注入容器初始化
 * - 自动处理中间件、守卫、拦截器等 NestJS 特性的注册
 * - 便于后续扩展（如添加全局中间件、CORS、Swagger 文档等）
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /**
   * 监听端口：从环境变量 PORT 读取，默认为 3000
   *
   * 使用 ?? (空值合并运算符) 而非 || ：
   * - || 会将 0、''、NaN 等假值视为 falsy，导致使用默认值
   * - ?? 只在值为 null 或 undefined 时才使用默认值，符合端口场景
   */
  const port = process.env.PORT ?? 3000;

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
// void 操作符明确表示我们故意不 await 这个 promise
// 为什么要这样：ESLint 的 @typescript-eslint/no-floating-promises 规则要求
// 函数入口点的 promise 不能处于未处理状态，void 只是一个视觉标记
void bootstrap();

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
