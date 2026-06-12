/**
 * 用户服务
 *
 * 为什么要单独抽离 UserService：
 * - 单一职责原则，用户相关业务逻辑集中管理
 * - 便于后续扩展（如用户统计、禁用等）
 * - 便于单独测试和 mock
 *
 * 主要功能：
 * - 用户创建
 * - 用户查询（按用户名、邮箱、ID）
 *
 * 关联性：
 * - 被 AuthService 依赖，用于注册和登录
 * - 被 JWT 策略依赖，用于获取用户信息
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/user/entities/user.entity';

/**
 * @Injectable() 装饰器
 * 为什么要这样：声明 UserService 为 NestJS 可注入服务
 * - NestJS 依赖注入容器自动管理实例
 * - 构造函数参数自动注入
 */
@Injectable()
export class UserService {
  /**
   * 构造函数
   *
   * 为什么要注入 Repository：
   * - TypeORM 的依赖注入方式
   * - 提供 find, save, create, delete 等数据库操作方法
   *
   * Repository 提供的方法：
   * - find()：查询多条记录
   * - findOne()：查询单条记录
   * - save()：保存或更新记录
   * - create()：创建实体实例
   * - delete()：删除记录
   *
   * @param userRepository - User 实体的 TypeORM 仓库
   */
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * 创建用户
   *
   * 为什么要分 create() 和 save()：
   * - create()：创建实体实例，不写入数据库
   * - save()：保存实例到数据库
   * - 分离便于预处理实体数据
   *
   * @param data - 用户数据（username, email, password 等）
   * @returns Promise<User> - 创建后的用户实体
   *
   * 流程：
   * 1. userRepository.create() 创建实体实例
   * 2. userRepository.save() 保存到数据库
   *
   * 关联性：
   * - 被 AuthService.register() 调用
   */
  async create(data: Partial<User>): Promise<User> {
    /**
     * create() 方法
     * 为什么要这样：创建 User 实体实例，不立即写入数据库
     * 场景：准备用户数据，尚未提交
     * 结果：返回 User 实体实例
     */
    const user = this.userRepository.create(data);

    /**
     * save() 方法
     * 为什么要这样：将实体实例写入数据库
     * 场景：用户注册，校验通过后
     * 结果：返回已保存的用户实体（包含 ID）
     */
    return this.userRepository.save(user);
  }

  /**
   * 根据用户名查找用户
   *
   * 为什么要用 findOne()：
   * - 用户名具有唯一性，只需返回一条记录
   * - findOne() 比 find() 更高效
   *
   * @param username - 用户名
   * @returns Promise<User | null> - 找到返回 User，否则 null
   *
   * 用途：
   * - 登录时验证用户名是否存在
   * - 注册时检查用户名是否被占用
   *
   * 关联性：
   * - 被 AuthService.login() 调用
   * - 被 AuthService.register() 调用
   */
  async findByUsername(username: string): Promise<User | null> {
    /**
     * findOne() 方法
     * 为什么要这样：根据条件查询单条记录
     * 参数 where: { username } - 查询条件对象
     * 场景：用户登录，输入用户名
     * 结果：返回匹配的用户或 null
     */
    return this.userRepository.findOne({ where: { username } });
  }

  /**
   * 根据邮箱查找用户
   *
   * 为什么要这样：
   * - 邮箱具有唯一性
   * - 用于注册校验和密码找回
   *
   * @param email - 邮箱地址
   * @returns Promise<User | null> - 找到返回 User，否则 null
   *
   * 关联性：
   * - 被 AuthService.register() 调用
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  /**
   * 根据 ID 查找用户
   *
   * 为什么要这样：
   * - ID 是用户唯一标识
   * - JWT 策略需要通过 ID 获取用户信息
   *
   * @param id - 用户 ID
   * @returns Promise<User | null> - 找到返回 User，否则 null
   *
   * 关联性：
   * - 被 JwtStrategy.validate() 调用
   */
  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  /**
   * 更新用户
   *
   * 为什么要单独写更新方法：
   * - 封装更新逻辑
   * - 便于后续添加业务校验
   *
   * @param id - 用户 ID
   * @param data - 要更新的字段
   * @returns Promise<User> - 更新后的用户
   */
  async update(id: number, data: Partial<User>): Promise<User | null> {
    /**
     * 先查询用户
     * 为什么要这样：确保用户存在
     */
    const user = await this.findById(id);
    if (!user) {
      return null;
    }

    /**
     * 更新用户
     * 为什么要这样：合并现有数据和更新数据
     */
    const updatedUser = this.userRepository.create({ ...user, ...data });
    return this.userRepository.save(updatedUser);
  }
}
