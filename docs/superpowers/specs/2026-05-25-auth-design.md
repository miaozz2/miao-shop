# 认证模块设计

## 概述

实现电商网站后端认证模块，支持用户注册、登录、JWT 认证和 AES 签名校验。

## 1. 技术选型

- **认证**：JWT（jsonwebtoken + @nestjs/jwt）
- **密码加密**：bcrypt
- **签名加密**：crypto-js（AES）
- **ORM**：TypeORM + PostgreSQL
- **配置管理**：@nestjs/config + dotenv

## 2. 数据模型

### User Entity

```typescript
// src/user/user.entity.ts
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column()
  password: string; // bcrypt 加密存储

  @Column({ nullable: true })
  avatar: string;

  @Column({ default: 'user' })
  role: string; // 'user' | 'admin'

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

## 3. 模块结构

```
src/
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── dto/
│   │   ├── register.dto.ts
│   │   └── login.dto.ts
│   ├── strategies/
│   │   └── jwt.strategy.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   ├── roles.guard.ts
│   │   └── signature.guard.ts
│   ├── decorators/
│   │   └── roles.decorator.ts
│   └── middleware/
│       └── signature.middleware.ts (全局签名中间件，可选)
├── user/
│   ├── user.module.ts
│   ├── user.service.ts
│   └── user.entity.ts
└── config/
    └── configuration.ts
```

## 4. 环境变量

```bash
# .env
AES_KEY=DYi2KOv9UwabixY4GZCSxX==
AES_ID=FQAziVSKNT1Th5wi
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
PORT=3000
```

## 5. 接口设计

### 5.1 注册 POST /auth/register

**请求体：**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**响应：**
```json
{
  "id": 1,
  "username": "string",
  "email": "string"
}
```

### 5.2 登录 POST /auth/login

**请求体：**
```json
{
  "username": "string",
  "password": "string"
}
```

**响应：**
```json
{
  "accessToken": "string",
  "refreshToken": "string"
}
```

### 5.3 刷新 Token POST /auth/refresh

**请求体：**
```json
{
  "refreshToken": "string"
}
```

**响应：**
```json
{
  "accessToken": "string",
  "refreshToken": "string"
}
```

## 6. 守卫设计

### 6.1 SignatureGuard（签名校验）

- 使用 crypto-js AES 解密时间戳
- 时效窗口：5 分钟
- 超过时限返回 401

```typescript
// 使用方式（按需添加）
@Post('secure-endpoint')
@UseGuards(SignatureGuard)
create() {}
```

### 6.2 JwtAuthGuard（JWT 认证）

- 验证 Bearer Token
- 提取 userId 挂载到 request.user

```typescript
// 使用方式
@Get('profile')
@UseGuards(JwtAuthGuard)
getProfile() {}
```

### 6.3 RolesGuard（角色校验）

- 配合 @Roles() 装饰器使用
- 校验用户角色是否匹配

```typescript
// 使用方式
@Delete(':id')
@UseGuards(JwtAuthGuard, RolesGuard('admin'))
@Roles('admin')
deleteUser() {}
```

## 7. 签名校验流程

```
客户端:
  timestamp = Date.now()
  signature = AES.encrypt(timestamp.toString(), AES_KEY, AES_ID)
  headers['X-Signature'] = signature

服务端 SignatureGuard:
  1. 读取 headers['X-Signature']
  2. decryptedTimestamp = AES.decrypt(signature, AES_KEY, AES_ID)
  3. if (Date.now() - decryptedTimestamp > 5min) return 401
  4. next()
```

## 8. JWT Token 设计

- **access_token**：15 分钟有效，包含 userId、role
- **refresh_token**：7 天有效，用于刷新

## 9. 开发阶段任务

1. 安装依赖：@nestjs/jwt、@nestjs/config、bcrypt、crypto-js、typeorm、pg
2. 配置环境变量加载
3. 创建 User Entity
4. 创建 Auth 模块、Controller、Service
5. 实现 JWT Strategy
6. 实现 SignatureGuard
7. 实现 JwtAuthGuard、RolesGuard
8. 编写单元测试