/**
 * 用户控制器
 *
 * 接口列表：
 * - GET /api/users/profile - 获取当前用户资料（需登录）
 * - PATCH /api/users/profile - 修改当前用户资料（需登录）
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

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: any) {
    return this.userService.findById(req.user.userId);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Request() req: any, @Body() updateData: any) {
    const userId = req.user.userId;

    const allowedFields = ['phone', 'avatar'];
    const sanitizedData: any = {};
    for (const key of allowedFields) {
      if (updateData[key] !== undefined) {
        sanitizedData[key] = updateData[key];
      }
    }

    return this.userService.update(userId, sanitizedData);
  }
}
