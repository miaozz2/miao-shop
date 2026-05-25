# 认证模块实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**目标：** 实现用户注册、登录、JWT 认证和 AES 签名校验模块

**架构：** 使用 NestJS 模块化架构，Auth 模块处理认证相关业务，User 模块处理用户数据，通过 JWT + Signature 双层安全机制保护接口

**技术栈：** NestJS, TypeORM, PostgreSQL, @nestjs/jwt, bcrypt, crypto-js

---

## 文件结构

```
src/
├── main.ts                      # 应用入口（已存在）
├── app.module.ts                # 根模块（已存在）
├── config/
│   └── configuration.ts        # 配置加载模块
├── user/
│   ├── user.module.ts          # 用户模块
│   ├── user.service.ts          # 用户服务
│   └── user.entity.ts          # 用户实体
└── auth/
    ├── auth.module.ts          # 认证模块
    ├── auth.controller.ts      # 认证接口
    ├── auth.service.ts        # 认证服务
    ├── dto/
    │   ├── register.dto.ts    # 注册 DTO
    │   └── login.dto.ts       # 登录 DTO
    ├── strategies/
    │   └── jwt.strategy.ts    # Passport JWT 策略
    ├── guards/
    │   ├── jwt-auth.guard.ts   # JWT 认证守卫
    │   ├── roles.guard.ts      # 角色校验守卫
    │   └── signature.guard.ts  # 签名校验守卫
    └── decorators/
        └── roles.decorator.ts  # @Roles 装饰器
```

**涉及文件：**
- 修改: `src/app.module.ts` - 导入新模块
- 修改: `src/main.ts` - 配置 CORS
- 创建: `src/config/configuration.ts`
- 创建: `src/user/user.module.ts`
- 创建: `src/user/user.service.ts`
- 创建: `src/user/user.entity.ts`
- 创建: `src/auth/auth.module.ts`
- 创建: `src/auth/auth.controller.ts`
- 创建: `src/auth/auth.service.ts`
- 创建: `src/auth/dto/register.dto.ts`
- 创建: `src/auth/dto/login.dto.ts`
- 创建: `src/auth/strategies/jwt.strategy.ts`
- 创建: `src/auth/guards/jwt-auth.guard.ts`
- 创建: `src/auth/guards/roles.guard.ts`
- 创建: `src/auth/guards/signature.guard.ts`
- 创建: `src/auth/decorators/roles.decorator.ts`
- 创建: `.env`

---

## 实施任务

### Task 1: 安装依赖

**文件：**
- 修改: `package.json` - 添加新依赖

- [ ] **Step 1: 安装认证相关依赖**

```bash
npm install @nestjs/jwt @nestjs/config bcryptjs crypto-js typeorm pg dotenv
npm install -D @types/bcryptjs @types/crypto-js
```

---

### Task 2: 配置环境变量

**文件：**
- 创建: `.env` - 环境变量文件

- [ ] **Step 1: 创建 .env 文件**

```bash
# AES 加密配置（生产环境必须修改）
AES_KEY=DYi2KOv9UwabixY4GZCSxX==
AES_ID=FQAziVSKNT1Th5wi

# JWT 配置
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# 数据库配置
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=miao_shop

# 服务端口
PORT=3000
```

---

### Task 3: 创建配置加载模块

**文件：**
- 创建: `src/config/configuration.ts` - 配置管理

- [ ] **Step 1: 创建配置管理模块**

```typescript
/**
 * 配置管理模块
 *
 * 为什么使用 @nestjs/config：
 * - 将 .env 文件中的环境变量加载到 process.env
 * - 支持类型安全的配置访问
 * - 便于测试时覆盖配置
 *
 * 关联性：
 * - 被 auth.module.ts 和 app.module.ts 导入使用
 */
import { registerAs } from '@nestjs/config';

export const configuration = registerAs('app', () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  aesKey: process.env.AES_KEY,
  aesId: process.env.AES_ID,
}));

export const jwtConfiguration = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
}));
```

---

### Task 4: 创建 User 实体

**文件：**
- 创建: `src/user/user.entity.ts` - 用户实体

- [ ] **Step 1: 创建 User 实体**

```typescript
/**
 * 用户实体
 *
 * 为什么使用 TypeORM Entity：
 * - 映射 PostgreSQL 数据库表
 * - 提供类型安全的数据库操作
 *
 * 关联性：
 * - 被 user.service.ts 使用进行数据库查询
 * - 被 auth.service.ts 使用验证用户
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 用户名，唯一索引
   * 用于登录
   */
  @Column({ unique: true })
  username: string;

  /**
   * 邮箱，唯一索引
   * 用于注册和密码找回
   */
  @Column({ unique: true })
  email: string;

  /**
   * 手机号，可为空
   * 备用联系方式
   */
  @Column({ nullable: true })
  phone: string;

  /**
   * 密码
   * bcrypt 加密存储，永不明文保存
   */
  @Column()
  password: string;

  /**
   * 头像 URL
   */
  @Column({ nullable: true })
  avatar: string;

  /**
   * 角色
   * - 'user': 普通用户
   * - 'admin': 管理员
   *
   * 关联性：
   * - 被 RolesGuard 用于权限校验
   */
  @Column({ default: 'user' })
  role: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

---

### Task 5: 创建 User 模块和服务

**文件：**
- 创建: `src/user/user.service.ts` - 用户服务
- 创建: `src/user/user.module.ts` - 用户模块

- [ ] **Step 1: 创建 User 服务**

```typescript
/**
 * 用户服务
 *
 * 为什么单独抽离 UserService：
 * - 单一职责原则，用户相关业务逻辑集中管理
 * - 便于后续扩展（如用户统计、禁用等）
 * - 便于单独测试
 *
 * 关联性：
 * - 被 auth.service.ts 依赖，用于注册和登录时的用户查询
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    /**
     * 注入 User 仓库
     *
     * 为什么使用 @InjectRepository：
     * - TypeORM 的依赖注入方式
     * - 提供 find, save 等数据库操作方法
     */
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * 创建用户
   *
   * @param data - 用户数据（username, email, password）
   * @returns 创建的用户（不含密码）
   *
   * 关联性：
   * - 被 auth.service.ts 注册时调用
   */
  async create(data: Partial<User>): Promise<User> {
    const user = this.userRepository.create(data);
    return this.userRepository.save(user);
  }

  /**
   * 根据用户名查找用户
   *
   * @param username - 用户名
   * @returns 用户或 undefined
   *
   * 关联性：
   * - 被 auth.service.ts 登录时调用
   */
  async findByUsername(username: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { username } });
  }

  /**
   * 根据邮箱查找用户
   *
   * @param email - 邮箱
   * @returns 用户或 undefined
   *
   * 关联性：
   * - 被 auth.service.ts 注册时检查重复
   */
  async findByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { email } });
  }

  /**
   * 根据 ID 查找用户
   *
   * @param id - 用户 ID
   * @returns 用户或 undefined
   *
   * 关联性：
   * - 被 JWT 策略提取用户信息
   */
  async findById(id: number): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { id } });
  }
}
```

- [ ] **Step 2: 创建 User 模块**

```typescript
/**
 * 用户模块
 *
 * 为什么使用 @Module：
 * - NestJS 模块化架构的基础
 * - 集中管理 User 相关的 Providers 和 Controllers
 *
 * 关联性：
 * - 被 app.module.ts 导入
 * - 导出 UserService 给 AuthModule 使用（跨模块依赖）
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserService],
  exports: [UserService], // 导出给 AuthModule 使用
})
export class UserModule {}
```

---

### Task 6: 创建 Auth DTOs

**文件：**
- 创建: `src/auth/dto/register.dto.ts` - 注册 DTO
- 创建: `src/auth/dto/login.dto.ts` - 登录 DTO

- [ ] **Step 1: 创建 Register DTO**

```typescript
/**
 * 注册 DTO
 *
 * 为什么使用 class-validator：
 * - 自动验证请求体参数
 * - 提供清晰的错误信息
 *
 * 关联性：
 * - 被 auth.controller.ts register 方法使用
 */
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: '用户名不能为空' })
  username: string;

  @IsEmail({}, { message: '邮箱格式不正确' })
  @IsNotEmpty({ message: '邮箱不能为空' })
  email: string;

  @IsString()
  @MinLength(6, { message: '密码至少6位' })
  @IsNotEmpty({ message: '密码不能为空' })
  password: string;
}
```

- [ ] **Step 2: 创建 Login DTO**

```typescript
/**
 * 登录 DTO
 *
 * 关联性：
 * - 被 auth.controller.ts login 方法使用
 */
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: '用户名不能为空' })
  username: string;

  @IsString()
  @IsNotEmpty({ message: '密码不能为空' })
  password: string;
}
```

---

### Task 7: 创建 JWT 策略

**文件：**
- 创建: `src/auth/strategies/jwt.strategy.ts` - JWT 策略

- [ ] **Step 1: 创建 JWT 策略**

```typescript
/**
 * JWT 策略
 *
 * 为什么使用 Passport 的 Strategy：
 * - NestJS 官方推荐的认证方案
 * - 与 @nestjs/passport 和 @nestjs/jwt 配合良好
 * - 便于后续扩展第三方登录（OAuth）
 *
 * 工作流程：
 * 1. JwtAuthGuard 拦截请求，提取 Bearer Token
 * 2. 本策略验证 Token，获取 payload（userId）
 * 3. 将用户信息挂载到 request.user
 *
 * 关联性：
 * - 被 auth.module.ts 的 providers 引入
 * - 被 JwtAuthGuard 隐式调用
 */
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      /**
       * 从请求头提取 Token
       * 格式：Authorization: Bearer <token>
       */
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      /**
       * 忽略过期（由 Guard 处理更清晰）
       */
      ignoreExpiration: false,
      /**
       * 从环境变量获取密钥
       */
      secretOrKey: configService.get<string>('jwt.secret'),
    });
  }

  /**
   * 验证通过后的回调
   *
   * @param payload - Token 解码后的 payload
   * @returns 挂载到 request.user 的用户信息
   *
   * 关联性：
   * - payload.userId 用于在 UserService 中查询完整用户
   */
  async validate(payload: { userId: number; role: string }) {
    return { userId: payload.userId, role: payload.role };
  }
}
```

---

### Task 8: 创建 JWT Auth Guard

**文件：**
- 创建: `src/auth/guards/jwt-auth.guard.ts` - JWT 认证守卫

- [ ] **Step 1: 创建 JwtAuthGuard**

```typescript
/**
 * JWT 认证守卫
 *
 * 为什么使用 @Injectable + UseGuards：
 * - NestJS 请求生命周期的一部分
 * - 在控制器方法执行前拦截，进行身份验证
 * - 返回 401 表示未认证
 *
 * 使用方式（按需添加，非全局）：
 * ```typescript
 * @Get('profile')
 * @UseGuards(JwtAuthGuard)
 * getProfile() {}
 * ```
 *
 * 关联性：
 * - 依赖 JwtStrategy 验证 Token
 * - 与 RolesGuard 组合实现角色权限控制
 */
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  /**
   * canActivate - 请求拦截点
   *
   * 为什么重写：
   * - 默认的 AuthGuard 只处理 JWT 验证
   * - 需要添加自定义错误处理
   */
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  /**
   * handleRequest - 自定义异常处理
   *
   * @param err - 验证错误
   * @param user - 验证通过的用户信息
   */
  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('未登录或 Token 无效');
    }
    return user;
  }
}
```

---

### Task 9: 创建签名校验 Guard

**文件：**
- 创建: `src/auth/guards/signature.guard.ts` - 签名校验守卫

- [ ] **Step 1: 创建 SignatureGuard**

```typescript
/**
 * 签名校验守卫
 *
 * 为什么需要签名校验：
 * - 防止重放攻击（Replay Attack）
 * - 请求被截获后无法在有效期内重放
 *
 * 时效窗口：5 分钟
 *
 * 客户端签名流程：
 * ```javascript
 * import CryptoJS from 'crypto-js';
 * const timestamp = Date.now();
 * const signature = CryptoJS.AES.encrypt(
 *   timestamp.toString(),
 *   AES_KEY,
 *   AES_ID
 * ).toString();
 * // 发送 X-Signature 头
 * ```
 *
 * 使用方式（按需添加）：
 * ```typescript
 * @Post('secure-endpoint')
 * @UseGuards(SignatureGuard)
 * create() {}
 * ```
 *
 * 关联性：
 * - 依赖 crypto-js 进行 AES 解密
 * - 从 ConfigService 读取 AES_KEY 和 AES_ID
 */
import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class SignatureGuard {
  constructor(private readonly configService: ConfigService) {}

  /**
   * 签名校验逻辑
   *
   * @param context - 请求上下文
   * @throws UnauthorizedException - 签名无效或过期
   */
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const signature = request.headers['x-signature'];

    if (!signature) {
      throw new UnauthorizedException('缺少签名');
    }

    try {
      // 解密获取时间戳
      const decrypted = CryptoJS.AES.decrypt(
        signature,
        this.configService.get<string>('app.aesKey'),
        this.configService.get<string>('app.aesId'),
      );
      const timestamp = parseInt(decrypted.toString(CryptoJS.enc.Utf8), 10);

      // 检查时效性（5 分钟 = 300000ms）
      const now = Date.now();
      if (now - timestamp > 5 * 60 * 1000) {
        throw new UnauthorizedException('签名已过期');
      }

      return true;
    } catch {
      throw new UnauthorizedException('签名无效');
    }
  }
}
```

---

### Task 10: 创建 Roles 装饰器和 Guard

**文件：**
- 创建: `src/auth/decorators/roles.decorator.ts` - @Roles 装饰器
- 创建: `src/auth/guards/roles.guard.ts` - 角色校验守卫

- [ ] **Step 1: 创建 @Roles 装饰器**

```typescript
/**
 * @Roles 装饰器
 *
 * 为什么使用装饰器：
 * - 声明式指定方法需要的角色
 * - 与 RolesGuard 配合使用
 *
 * 使用方式：
 * ```typescript
 * @Delete(':id')
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles('admin')
 * deleteUser() {}
 * ```
 *
 * 关联性：
 * - 被 RolesGuard 读取 metadata 获取所需角色
 */
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

- [ ] **Step 2: 创建 RolesGuard**

```typescript
/**
 * 角色校验守卫
 *
 * 为什么使用角色守卫：
 * - 实现 RBAC（基于角色的访问控制）
 * - 保护管理员接口
 *
 * 工作流程：
 * 1. 从 @Roles() 装饰器读取所需角色
 * 2. 从 request.user 读取当前用户角色
 * 3. 匹配则通过，否则 403
 *
 * 使用方式（需配合 @Roles 装饰器）：
 * ```typescript
 * @Post('admin-only')
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles('admin')
 * adminOnly() {}
 * ```
 *
 * 关联性：
 * - 依赖 JwtAuthGuard 先验证登录
 * - 依赖 @Roles 装饰器定义角色
 */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 读取 @Roles() 装饰器定义的角色
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // 没有 @Roles 装饰器则放行
    if (!requiredRoles) {
      return true;
    }

    // 从 request.user 读取当前用户角色
    const { user } = context.switchToHttp().getRequest();
    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      throw new ForbiddenException('没有权限');
    }

    return true;
  }
}
```

---

### Task 11: 创建 Auth 服务

**文件：**
- 创建: `src/auth/auth.service.ts` - 认证服务

- [ ] **Step 1: 创建 Auth 服务**

```typescript
/**
 * 认证服务
 *
 * 为什么使用 @Injectable：
 * - 封装所有认证相关业务逻辑
 * - 便于单元测试时 mock
 *
 * 关联性：
 * - 被 auth.controller.ts 调用
 * - 依赖 UserService 查询用户
 * - 依赖 JwtService 生成 Token
 */
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * 注册
   *
   * @param dto - 注册信息
   * @returns 创建的用户（不含密码）
   *
   * 流程：
   * 1. 检查用户名和邮箱是否已被使用
   * 2. bcrypt 加密密码
   * 3. 创建用户
   */
  async register(dto: RegisterDto) {
    // 检查用户名是否存在
    const existingUsername = await this.userService.findByUsername(dto.username);
    if (existingUsername) {
      throw new ConflictException('用户名已被使用');
    }

    // 检查邮箱是否存在
    const existingEmail = await this.userService.findByEmail(dto.email);
    if (existingEmail) {
      throw new ConflictException('邮箱已被使用');
    }

    // bcrypt 加密密码
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 创建用户
    const user = await this.userService.create({
      username: dto.username,
      email: dto.email,
      password: hashedPassword,
    });

    // 返回不含密码的用户信息
    const { password: _, ...result } = user;
    return result;
  }

  /**
   * 登录
   *
   * @param dto - 登录信息
   * @returns accessToken + refreshToken
   *
   * 流程：
   * 1. 根据用户名查找用户
   * 2. 验证密码
   * 3. 生成 JWT Token
   */
  async login(dto: LoginDto) {
    const user = await this.userService.findByUsername(dto.username);
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 生成 Token（包含 userId 和 role）
    const payload = { userId: user.id, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  /**
   * 刷新 Token
   *
   * @param refreshToken - 刷新 Token
   * @returns 新的 accessToken + refreshToken
   */
  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      return {
        accessToken: this.jwtService.sign({ userId: payload.userId, role: payload.role }),
        refreshToken: this.jwtService.sign(
          { userId: payload.userId, role: payload.role },
          { expiresIn: '7d' },
        ),
      };
    } catch {
      throw new UnauthorizedException('refreshToken 无效');
    }
  }
}
```

---

### Task 12: 创建 Auth 控制器

**文件：**
- 创建: `src/auth/auth.controller.ts` - 认证控制器

- [ ] **Step 1: 创建 Auth 控制器**

```typescript
/**
 * 认证控制器
 *
 * 为什么使用 @Controller('auth')：
 * - 路由前缀 /auth
 * - 处理所有认证相关请求
 *
 * 关联性：
 * - 被 auth.module.ts 注册
 * - 调用 auth.service.ts 处理业务逻辑
 */
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/register
   *
   * 注册接口（公开，无需认证）
   */
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /**
   * POST /auth/login
   *
   * 登录接口（公开，无需认证）
   */
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /**
   * POST /auth/refresh
   *
   * 刷新 Token 接口（公开，无需认证）
   */
  @Post('refresh')
  refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refresh(refreshToken);
  }
}
```

---

### Task 13: 创建 Auth 模块

**文件：**
- 创建: `src/auth/auth.module.ts` - 认证模块

- [ ] **Step 1: 创建 Auth 模块**

```typescript
/**
 * 认证模块
 *
 * 为什么单独作为模块：
 * - 认证逻辑独立封装
 * - 便于后续扩展第三方登录
 * - 便于单独测试
 *
 * 关联性：
 * - 导入 UserModule 获取用户服务
 * - 导入 JwtModule 提供 JWT 服务
 * - 注册 JwtStrategy、Guards、Decorator
 */
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { SignatureGuard } from './guards/signature.guard';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    // 导入用户模块（跨模块依赖）
    UserModule,

    // Passport 模块
    PassportModule,

    // JWT 模块
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    SignatureGuard,
  ],
  // 导出 Guards 和 Decorators 给其他模块使用
  exports: [AuthService, JwtAuthGuard, RolesGuard, SignatureGuard],
})
export class AuthModule {}
```

---

### Task 14: 更新 App 模块和 Main

**文件：**
- 修改: `src/app.module.ts` - 导入新模块
- 修改: `src/main.ts` - 配置 CORS 和验证管道

- [ ] **Step 1: 更新 App 模块**

```typescript
/**
 * 根模块
 *
 * 关联性：
 * - 导入 AuthModule 处理认证
 * - 导入 TypeORM 连接数据库
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { configuration, jwtConfiguration } from './config/configuration';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration, jwtConfiguration],
    }),

    // TypeORM 连接
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
      username: process.env.DATABASE_USERNAME || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres',
      database: process.env.DATABASE_NAME || 'miao_shop',
      autoLoadEntities: true, // 自动加载 Entities
      synchronize: true, // 开发环境自动同步（生产环境关闭）
    }),

    // 功能模块
    AuthModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

- [ ] **Step 2: 更新 Main 入口**

```typescript
/**
 * 应用入口
 *
 * 更新内容：
 * - 配置 CORS（允许前端调用）
 * - 全局验证管道（验证 DTO）
 * - 全局前缀
 */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 启用 CORS（允许前端跨域调用）
  app.enableCors();

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 移除不在 DTO 定义中的属性
      transform: true, // 自动类型转换
    }),
  );

  // 全局前缀
  app.setGlobalPrefix('api');

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`应用运行在 http://localhost:${port}/api`);
}
bootstrap();
```

---

### Task 15: 验证编译

**文件：**
- 测试整个流程

- [ ] **Step 1: 运行编译**

```bash
npm run build
```

预期：编译成功，无错误

- [ ] **Step 2: 运行测试**

```bash
npm test
```

预期：所有测试通过

---

## 执行方式

**请选择：**

**1. Subagent-Driven（推荐）** - 我调度独立子任务，快速迭代

**2. Inline Execution** - 在当前会话中逐步执行任务

请告诉我您选择的方式？