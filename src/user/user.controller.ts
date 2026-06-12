/**
 * 用户控制器
 *
 * 为什么使用 @Controller('users')：
 * - 路由前缀 /users
 * - 处理所有用户相关 HTTP 请求
 *
 * 接口列表：
 * - GET /api/users/profile - 获取当前用户资料（需登录）
 * - PATCH /api/users/profile - 修改当前用户资料（需登录）
 *
 * 守卫链：
 * - @UseGuards(JwtAuthGuard, SignatureGuard)：JWT 身份认证 + 签名验证
 * - @UseSignature()：标记需要签名验证（SignatureGuard 会读取此标记）
 * - 执行顺序：先 JwtAuthGuard → 再 SignatureGuard
 *
 * 为什么守卫放在类上：
 * - 类级别的守卫和装饰器会被所有方法继承
 * - 无需在每个方法上单独添加
 * - 保持代码简洁，便于维护
 *
 * 关联性：
 * - 被 user.module.ts 注册
 * - 调用 user.service.ts 处理业务逻辑
 * - UserModule imports AuthModule 提供 SignatureService
 */
import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UserService } from '@/user/user.service';
import { JwtAuthGuard } from '@/core/guards/jwt-auth.guard';
import { SignatureGuard } from '@/core/guards/signature.guard';
import { UseSignature } from '@/common/decorators/use-signature.decorator';

/**
 * @Controller('users') 装饰器
 * @description 声明 UserController 为 NestJS 控制器
 * - 路由前缀：/users
 * - 处理用户相关请求
 *
 * @UseGuards(JwtAuthGuard, SignatureGuard) 类级别守卫
 * @description JWT 身份认证 + 签名验证，所有方法都需要
 * - JwtAuthGuard：从 Authorization 头提取 Bearer Token，验证 Token 有效性
 * - SignatureGuard：读取 @UseSignature() 标记，验证 x-signature 头
 *
 * @UseSignature() 类级别装饰器
 * @description 标记此 Controller 所有方法需要签名验证
 * - SignatureGuard 会读取此标记并执行验证
 * - 从 X-Signature 头提取签名，AES 解密验证时间戳
 *
 * 为什么需要两个：
 * - @UseGuards 召集守卫执行
 * - @UseSignature 只是标记，SignatureGuard 需要它才知道要验证
 *
 * 为什么放在类上：
 * - 所有方法都需要 JWT 认证和签名验证
 * - 放在类上避免每个方法重复添加
 */
@Controller('users')
@UseGuards(JwtAuthGuard, SignatureGuard)
@UseSignature()
export class UserController {
  /**
   * 构造函数
   *
   * 为什么使用构造函数注入：
   * - NestJS 推荐的依赖注入方式
   * - 控制器不应该包含业务逻辑，只负责请求/响应
   * - 业务逻辑委托给 Service 层
   *
   * @param userService - 用户服务实例
   * - 用于处理用户资料的查询和更新
   */
  constructor(private readonly userService: UserService) {}

  /**
   * GET /api/users/profile - 获取当前用户资料
   *
   * @returns Promise<User> - 当前用户信息
   *
   * 为什么需要认证：
   * - 用户资料只能本人查看
   * - 需要先登录获取 Token
   *
   * 流程：
   * 1. JwtAuthGuard 验证 Token，获取 userId
   * 2. SignatureGuard 验证签名（防止重放攻击）
   * 3. 从 request.user 提取 userId
   * 4. 调用 userService.findById() 查询用户信息
   * 5. 返回用户资料（不包含密码）
   *
   * 关联性：
   * - request.user.userId 由 JwtStrategy.validate() 填充
   * - userService.findById() 调用 User entity 的数据库操作
   */
  @Get('profile')
  async getProfile(@Request() req: any) {
    /**
     * @param req - HTTP 请求对象
     * @description 包含用户信息
     * - req.user.userId：由 JwtAuthGuard 填充
     * - 用于查询当前登录用户的资料
     */
    return this.userService.findById(req.user.userId);
  }

  /**
   * PATCH /api/users/profile - 修改当前用户资料
   *
   * @param req - HTTP 请求对象，包含当前用户信息
   * @param updateData - 要更新的字段
   * @returns Promise<User | null> - 更新后的用户信息
   *
   * 为什么使用 PATCH 而不是 PUT：
   * - PATCH 用于部分更新，只需传要改的字段
   * - PUT 需要传完整对象
   *
   * 更新字段限制：
   * - 只允许更新 phone 和 avatar
   * - 其他字段（如 password、role）不允许修改
   * - 防止恶意修改安全相关字段
   *
   * 流程：
   * 1. JwtAuthGuard 验证 Token，获取 userId
   * 2. SignatureGuard 验证签名（防止重放攻击）
   * 3. 从 request.user 提取 userId
   * 4. 过滤只允许的字段（phone、avatar）
   * 5. 调用 userService.update() 更新用户
   * 6. 返回更新后的用户信息
   */
  @Patch('profile')
  async updateProfile(@Request() req: any, @Body() updateData: any) {
    /**
     * 提取用户 ID
     * @description 从 request.user 获取当前登录用户的 ID
     * - req.user 由 JwtAuthGuard 和 JwtStrategy 填充
     * - userId 来自 JWT Token 的 payload
     */
    const userId = req.user.userId;

    /**
     * 允许更新的字段
     * @description 安全设计：只允许用户修改部分字段
     * - phone：手机号
     * - avatar：头像 URL
     * - 其他字段（如 password、email、role）不允许修改
     *
     * 为什么这样设计：
     * - 防止通过 API 恶意修改密码、角色等敏感信息
     * - 密码修改应有单独的接口，需要验证旧密码
     * - 角色变更应由管理员操作
     */
    const allowedFields = ['phone', 'avatar'];

    /**
     * 数据过滤
     * @description 只保留允许更新的字段
     * - 遍历 allowedFields
     * - 只复制有值的字段到 sanitizedData
     * - 丢弃其他字段，即使前端传了也不处理
     */
    const sanitizedData: any = {};
    for (const key of allowedFields) {
      if (updateData[key] !== undefined) {
        sanitizedData[key] = updateData[key];
      }
    }

    /**
     * 更新用户
     * @description 调用 Service 层更新用户信息
     * - userId：从 JWT Token 解析出的用户 ID
     * - sanitizedData：过滤后的安全数据
     */
    return this.userService.update(userId, sanitizedData);
  }
}
