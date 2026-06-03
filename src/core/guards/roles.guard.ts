/**
 * 角色校验守卫
 *
 * 为什么需要角色守卫：
 * - 实现 RBAC（基于角色的访问控制）
 * - 保护需要特定角色才能访问的接口
 *
 * 工作原理：
 * 1. 从 @Roles() 装饰器读取需要的角色列表
 * 2. 从 request.user 读取当前用户的角色
 * 3. 匹配则通过，否则抛出 403 禁止访问
 *
 * 关联性：
 * - 依赖 JwtAuthGuard 先验证登录
 * - 依赖 @Roles 装饰器定义角色
 * - 依赖 Reflector 读取装饰器元数据
 */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '@/auth/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { user } = context.switchToHttp().getRequest() as any;

    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      throw new ForbiddenException('没有权限');
    }

    return true;
  }
}
