/**
 * 认证服务
 *
 * 为什么要单独作为服务：
 * - 封装所有认证相关业务逻辑，控制器只负责接收请求和返回响应
 * - 便于单元测试时 mock
 * - 便于后续扩展（如第三方登录、验证码等）
 *
 * 主要功能：
 * - 用户注册：密码加密、重复检查
 * - 用户登录：密码验证、Token 生成
 * - Token 刷新：accessToken 过期后用 refreshToken 获取新 Token
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
import { UserService } from '@/user/user.service';
import { RegisterDto } from '@/auth/dto/register.dto';
import { LoginDto } from '@/auth/dto/login.dto';

/**
 * @Injectable() 装饰器
 * 为什么要这样：声明 AuthService 为 NestJS 可注入服务
 * - NestJS 依赖注入容器会自动管理实例
 * - 构造函数参数会自动注入
 */
@Injectable()
export class AuthService {
  /**
   * 构造函数
   *
   * 为什么要使用构造函数注入：
   * - NestJS 推荐的依赖注入方式
   * - 依赖在创建时 resolve，无需手动查找
   * - 便于单元测试时替换为 mock
   *
   * 注入的服务：
   * - userService：用户服务，用于查询和创建用户
   * - jwtService：JWT 服务，用于签发和验证 Token
   *
   * @param userService - 用户服务实例
   * @param jwtService - JWT 服务实例
   */
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * 注册
   *
   * 为什么要返回值不含密码：
   * - 安全考虑：密码不应在响应中返回
   * - 防止信息泄露
   *
   * @param dto - RegisterDto 注册数据（username, email, password）
   * @returns 创建的用户信息（不含密码）
   *
   * 流程：
   * 1. 检查用户名是否已被使用 → 冲突则抛 ConflictException
   * 2. 检查邮箱是否已被使用 → 冲突则抛 ConflictException
   * 3. bcrypt 加密密码 → 密码安全存储，不明文保存
   * 4. 创建用户记录
   * 5. 返回用户信息（排除密码字段）
   */
  async register(dto: RegisterDto) {
    /**
     * 检查用户名是否存在
     * 为什么要这样：防止重复注册
     * 场景：用户 A 已注册，用户 B 再注册相同用户名
     * 结果：抛 ConflictException，提示"用户名已被使用"
     */
    const existingUsername = await this.userService.findByUsername(
      dto.username,
    );
    if (existingUsername) {
      throw new ConflictException('用户名已被使用');
    }

    /**
     * 检查邮箱是否存在
     * 为什么要这样：邮箱具有唯一性，用于找回密码
     * 场景：用户 A 用 email@example.com 注册，用户 B 再用相同邮箱
     * 结果：抛 ConflictException，提示"邮箱已被使用"
     */
    const existingEmail = await this.userService.findByEmail(dto.email);
    if (existingEmail) {
      throw new ConflictException('邮箱已被使用');
    }

    /**
     * bcrypt 加密密码
     * 为什么要用 bcrypt：
     * - 专为密码设计的哈希算法，可抵抗彩虹表攻击
     * - 包含 salt，防止相同密码产生相同哈希
     * - cost factor 可调节计算成本，防止暴力破解
     * 场景：用户注册密码为 "123456"
     * 结果：存储为类似 $2a$10$N9qo8uLOickgx2ZMRZoMye 的哈希值
     */
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    /**
     * 创建用户
     * 为什么要这样：保存用户到数据库
     * 场景：注册信息校验通过
     * 结果：返回创建的用户实体
     */
    const user = await this.userService.create({
      username: dto.username,
      email: dto.email,
      password: hashedPassword,
    });

    /**
     * 返回不含密码的用户信息
     * 为什么要排除密码字段：
     * - 安全考虑：密码不应在 API 响应中返回
     * - 使用对象解构排除 password 字段
     * 场景：用户注册成功后
     * 结果：返回 { id, username, email, ... } 不含 password
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user;
    return result;
  }

  /**
   * 登录
   *
   * 为什么要返回 Token：
   * - accessToken：用于后续 API 请求认证，有效期 15 分钟
   * - refreshToken：用于刷新过期的 accessToken，有效期 7 天
   *
   * @param dto - LoginDto 登录数据（username, password）
   * @returns { accessToken, refreshToken }
   *
   * 流程：
   * 1. 根据用户名查找用户 → 不存在则抛 UnauthorizedException
   * 2. bcrypt.compare() 验证密码 → 不匹配则抛 UnauthorizedException
   * 3. 生成 JWT Token（包含 userId 和 role）
   */
  async login(dto: LoginDto) {
    /**
     * 根据用户名查找用户
     * 为什么要这样：验证用户是否存在
     * 场景：用户输入用户名登录
     * 结果：存在则返回用户实体，不存在则抛异常
     */
    const user = await this.userService.findByUsername(dto.username);
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    /**
     * 验证密码
     * 为什么要用 bcrypt.compare()：
     * - 安全比较哈希值，防止时序攻击
     * - 自动处理 salt 验证
     * 场景：用户输入密码 "123456"，数据库存储哈希值
     * 结果：匹配返回 true，不匹配返回 false
     */
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    /**
     * 生成 JWT Token
     * 为什么要存储 userId 和 role：
     * - userId：用于标识用户身份
     * - role：用于接口权限校验
     * 场景：登录成功
     * 结果：返回 accessToken 和 refreshToken
     */
    const payload = { userId: user.id, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  /**
   * 刷新 Token
   *
   * 为什么要刷新机制：
   * - accessToken 有效期短（15 分钟），安全性更高
   * - refreshToken 有效期长（7 天），用于获取新的 accessToken
   * - 用户无需频繁输入密码登录
   *
   * @param refreshToken - refreshToken 字符串
   * @returns 新的 accessToken 和 refreshToken
   *
   * 流程：
   * 1. 验证 refreshToken 是否有效 → 无效则抛 UnauthorizedException
   * 2. 生成新的 Token 对
   */
  refresh(refreshToken: string) {
    /**
     * 验证 refreshToken
     * 为什么要 try-catch：
     * - Token 可能过期、被篡改、无效
     * - 需要捕获异常并转换为明确的错误信息
     * 场景：accessToken 过期，用户使用 refreshToken 获取新 Token
     * 结果：有效则返回新 Token，无效则抛异常
     */
    try {
      const payload = this.jwtService.verify(refreshToken);

      /**
       * 生成新的 Token 对
       * 为什么要同时返回 accessToken 和 refreshToken：
       * - 保持 Token 对的有效性一致
       * - 用户不需要重新登录
       * 场景：Token 刷新
       * 结果：返回新的 accessToken 和 refreshToken
       */
      const result = {
        accessToken: this.jwtService.sign({
          userId: payload.userId,
          role: payload.role,
        }),
        refreshToken: this.jwtService.sign(
          { userId: payload.userId, role: payload.role },
          { expiresIn: '7d' },
        ),
      };

      return result;
    } catch {
      /**
       * refreshToken 无效
       * 为什么要抛 UnauthorizedException：
       * - 认证相关错误统一使用 401
       * - 便于客户端区分认证失败和其他错误
       */
      throw new UnauthorizedException('refreshToken 无效');
    }
  }
}
