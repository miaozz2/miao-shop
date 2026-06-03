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
├── main.ts                          # 应用入口，全局管道/过滤器/拦截器注册
├── app.module.ts                    # 根模块，导入所有功能模块
├── app.controller.ts                # 根控制器，处理 GET /
├── app.service.ts                   # 根服务，提供 getHello()
├── app.controller.spec.ts           # 单元测试
│
├── config/                          # 环境配置（按域拆分）
│   ├── index.ts                     # 统一导出
│   ├── app.config.ts                # 应用配置（端口）
│   ├── jwt.config.ts                # JWT 配置（密钥、有效期）
│   ├── bcrypt.config.ts             # bcrypt 配置（salt rounds）
│   ├── signature.config.ts          # AES 签名配置（防重放攻击）
│   ├── database.config.ts           # 数据库连接配置
│   └── env.validation.ts           # Joi 验证 Schema，启动时校验环境变量
│
├── database/                         # 数据库连接
│   └── database.module.ts           # TypeORM 异步连接配置
│
├── core/                             # 全局基础设施
│   ├── filters/
│   │   └── http-exception.filter.ts # 全局异常过滤器（统一错误格式）
│   ├── interceptors/
│   │   └── success.interceptor.ts   # 全局响应拦截器（统一成功格式）
│   └── guards/
│       ├── jwt-auth.guard.ts        # JWT 认证守卫
│       ├── signature.guard.ts        # 防重放攻击守卫
│       └── roles.guard.ts           # 角色权限守卫
│
├── logger/                           # 日志模块
│   ├── logs.module.ts               # 日志模块定义
│   ├── logs.service.ts              # 日志 CRUD 服务
│   ├── logs.controller.ts           # 日志查询接口（仅 admin）
│   ├── dto/
│   │   └── get-logs.dto.ts         # 日志查询参数 DTO
│   ├── entities/
│   │   └── action-log.entity.ts     # 操作日志实体
│   └── interceptors/
│       └── request-log.interceptor.ts # 自动记录所有请求
│
├── common/                           # 公共模块
│   ├── utils/
│   │   ├── crypto.util.ts           # AES 加密/解密工具
│   │   └── date.util.ts             # 日期格式化工具
│   └── decorators/
│       └── use-signature.decorator.ts # @UseSignature() 防重放注解
│
├── auth/                              # 认证模块（JWT + Signature）
│   ├── auth.module.ts                # 认证模块定义
│   ├── auth.controller.ts            # 注册/登录/刷新 Token 接口
│   ├── auth.service.ts               # 认证业务逻辑
│   ├── dto/
│   │   ├── login.dto.ts              # 登录参数
│   │   └── register.dto.ts           # 注册参数
│   ├── strategies/
│   │   └── jwt.strategy.ts           # Passport JWT 策略
│   ├── services/
│   │   └── signature.service.ts     # 签名验证服务（依赖 CryptoUtil）
│   └── decorators/
│       └── roles.decorator.ts        # @Roles() 角色注解
│
└── user/                              # 用户模块
    ├── user.module.ts               # 用户模块定义
    ├── user.controller.ts           # 获取/更新个人资料接口
    ├── user.service.ts               # 用户 CRUD 服务
    ├── entities/
    │   └── user.entity.ts           # 用户实体
    └── dto/
        ├── create-user.dto.ts       # 创建用户参数
        └── update-user.dto.ts       # 更新用户参数
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