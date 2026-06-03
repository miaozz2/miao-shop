/**
 * JWT 认证守卫
 *
 * 为什么需要认证守卫：
 * - 保护需要用户登录才能访问的接口
 * - 验证请求携带的 JWT Token 是否有效
 * - 在控制器方法执行前拦截，未认证则返回 401
 *
 * 工作原理：
 * 1. 继承 AuthGuard('jwt')
 * 2. 拦截请求，提取 Authorization 头中的 Bearer Token
 * 3. 使用 JwtStrategy 验证 Token
 * 4. 验证通过则挂载用户信息到 request.user
 */
import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleRequest(err: any, user: any): any {
    if (err || !user) {
      throw err || new UnauthorizedException('未登录或 Token 无效');
    }
    return user;
  }
}
