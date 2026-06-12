/**
 * @Roles 装饰器
 *
 * 为什么使用装饰器：
 * - 声明式指定方法需要的角色
 * - 与 RolesGuard 配合使用
 * - 角色信息存储在元数据中，Guard 运行时读取
 *
 * 工作原理：
 * 1. @Roles('admin') 使用 SetMetadata 将 'admin' 存储到 ROLES_KEY
 * 2. RolesGuard 使用 Reflector 读取该元数据
 * 3. 根据元数据判断用户是否有权限
 *
 * 使用方式：
 * ```typescript
 * @Delete(':id')
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles('admin')
 * deleteUser() {}
 * ```
 *
 * 支持多个角色：
 * ```typescript
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles('admin', 'moderator')
 * deleteUser() {}  // admin 或 moderator 都可以
 * ```
 *
 * 关联性：
 * - 被 RolesGuard 读取 metadata 获取所需角色
 */
import { SetMetadata } from '@nestjs/common';

/**
 * 元数据 key
 * @description 用于存储角色信息的 key
 * - 使用 Symbol 避免与其他人冲突
 * - @Roles() 装饰器使用此 key 存储角色
 */
export const ROLES_KEY = 'roles';

/**
 * @Roles 装饰器工厂
 *
 * 为什么返回 SetMetadata：
 * - SetMetadata 是 NestJS 内置装饰器
 * - 用于将元数据附加到类或方法上
 *
 * @param roles - 角色列表，如 ['admin', 'moderator']
 * @returns 装饰器函数
 *
 * @example
 * @Roles('admin')  // 单个角色
 * @Roles('admin', 'moderator')  // 多个角色
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
