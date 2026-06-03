# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a NestJS TypeScript backend project (miao-shop). It listens on port 3000 by default.

## Commands

```bash
npm install          # Install dependencies
npm run build        # Compile TypeScript to dist/ via nest build
npm run start        # Run compiled app (nest start, NOT for production)
npm run start:dev    # Run in watch mode with hot reload
npm run start:debug  # Run in debug mode with watch
npm run start:prod   # Run production build (node dist/main)
npm run lint         # Lint and fix with ESLint
npm run format      # Format with Prettier
npm run test         # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:cov     # Run tests with coverage
npm run test:e2e     # Run e2e tests (uses test/jest-e2e.json)
```

Run a single test file: `npx jest src/app.controller.spec.ts`

## Architecture

Feature-based modular architecture:

- **Entry point**: [src/main.ts](src/main.ts) - Bootstrap, global pipes/filters/interceptors, `setGlobalPrefix('api')`
- **Root module**: [src/app.module.ts](src/app.module.ts) - Imports ConfigModule, DatabaseModule, AuthModule, UserModule, LogsModule
- **Config** ([src/config/](src/config/)) - Domain-specific configs (`appConfig`, `jwtConfig`, `bcryptConfig`, `signatureConfig`, `databaseConfig`) + Joi `envValidationSchema`
- **Database** ([src/database/](src/database/)) - `DatabaseModule` wraps `TypeOrmModule.forRootAsync()`
- **Core** ([src/core/](src/core/)) - Global infrastructure: `HttpExceptionFilter`, `SuccessInterceptor`, Guards (`JwtAuthGuard`, `RolesGuard`, `SignatureGuard`)
- **Common** ([src/common/](src/common/)) - Shared utilities: `CryptoUtil`, `DateUtil`, `@UseSignature()` decorator
- **Logger** ([src/logger/](src/logger/)) - `LogsModule` with `ActionLog` entity, `LogsService`, `LogsController`, `RequestLogInterceptor`
- **Auth** ([src/auth/](src/auth/)) - JWT auth with `SignatureService`, `JwtStrategy`
- **User** ([src/user/](src/user/)) - User entity + DTOs in `entities/` and `dto/` subdirectories

Tests live alongside source files with `.spec.ts` suffix.

## Key Technical Details

- Uses `module: nodenext` and `moduleResolution: nodenext` in TypeScript config
- Decorator metadata enabled (`emitDecoratorMetadata: true`, `experimentalDecorators: true`)
- Strict null checks enabled (`strictNullChecks: true`)
- TypeORM + PostgreSQL via `DatabaseModule` in `src/database/database.module.ts`
- ConfigModule loads environment variables via domain-specific configs in `src/config/`
- Joi `envValidationSchema` validates all env vars at startup
- Global `HttpExceptionFilter` and `SuccessInterceptor` registered in `main.ts`

## 路径别名

配置了 `@/` 作为 `src/` 的路径别名，引入文件时可以不用关心相对路径：

```typescript
// 之前
import { AppService } from '../app.service';

// 现在
import { AppService } from '@/app.service';
```

## 代码规范

- **Port 配置**：使用 `??`（空值合并运算符）而非 `||`，避免将 `0`、`''` 等假值当作无效值
- **@Controller() vs @RestController()**：使用 `@Controller()` 保持轻量，配合 `@Get()` 等装饰器显式指定 HTTP 方法
- **依赖注入**：控制器通过构造函数注入服务，业务逻辑不放在控制器层
- **@Injectable()**：声明类为 NestJS 依赖注入系统的服务提供者，支持自动扫描和 mock 测试