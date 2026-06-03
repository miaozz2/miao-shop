/**
 * 用户实体
 *
 * 什么是 Entity：
 * - TypeORM 的数据模型类
 * - 映射数据库表结构
 * - 每个实例对应表中一行数据
 *
 * 数据库表结构（users 表）：
 * - id：主键，自增
 * - username：唯一索引，用于登录
 * - email：唯一索引，用于注册和密码找回
 * - phone：手机号，可选
 * - password：bcrypt 加密存储
 * - avatar：头像 URL
 * - role：角色（user/admin）
 * - createdAt：创建时间
 * - updatedAt：更新时间
 *
 * 关联性：
 * - 被 UserService 用于数据库 CRUD
 * - 被 AuthService 用于用户注册和验证
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
  id!: number;

  @Column({ type: 'varchar', unique: true })
  username!: string;

  @Column({ type: 'varchar', unique: true })
  email!: string;

  @Column({ type: 'varchar', nullable: true })
  phone!: string | null;

  @Column({ type: 'varchar' })
  password!: string;

  @Column({ type: 'varchar', nullable: true })
  avatar!: string | null;

  @Column({ type: 'varchar', default: 'user' })
  role!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
