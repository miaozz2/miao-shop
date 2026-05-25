# miao-shop

NestJS TypeScript 后端项目。

## 环境要求

- Node.js
- npm

## 快速开始

```bash
npm install          # 安装依赖
npm run build        # 编译 TypeScript 到 dist/
npm run start:dev    # 开发模式（热重载）
npm run start:prod   # 生产模式
```

## 命令

| 命令 | 说明 |
|------|------|
| `npm run build` | 编译到 dist/ |
| `npm run start` | 运行编译后的应用（开发模式） |
| `npm run start:dev` | 热重载开发模式 |
| `npm run start:debug` | 调试模式 |
| `npm run start:prod` | 生产模式 |
| `npm run lint` | ESLint 检查并修复 |
| `npm run format` | Prettier 格式化 |
| `npm run test` | 单元测试 |
| `npm run test:watch` | 监听模式运行测试 |
| `npm run test:cov` | 测试覆盖率 |
| `npm run test:e2e` | 端到端测试 |

## 项目结构

```
src/
├── main.ts         # 应用入口
├── app.module.ts   # 根模块
├── app.controller.ts
├── app.service.ts
└── *.spec.ts       # 单元测试
```

## 路径别名

使用 `@/` 作为 src 目录的路径别名：

```typescript
// 之前
import { AppService } from '../app.service';

// 现在
import { AppService } from '@/app.service';
```

## 端口

默认端口 3000，可通过环境变量 `PORT` 修改。

```bash
PORT=8080 npm run start:prod
```