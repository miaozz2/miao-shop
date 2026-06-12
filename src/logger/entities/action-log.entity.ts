/**
 * 操作日志实体
 *
 * 什么是 Entity：
 * - TypeORM 的数据模型类
 * - 映射数据库表结构
 * - 每个实例对应表中一行数据
 *
 * 数据库表结构（action_logs 表）：
 * - id: 主键，自增
 * - userId: 用户 ID（字符串存储）
 * - action: 操作类型（如 "POST:/api/auth/login"）
 * - method: HTTP 方法（GET/POST/PATCH/DELETE）
 * - path: 请求路径
 * - requestBody: 请求体（JSON 字符串）
 * - responseBody: 响应体（JSON 字符串）
 * - statusCode: HTTP 状态码
 * - ip: 客户端 IP 地址
 * - createdAt: 创建时间
 *
 * 用途：
 * - 记录所有 HTTP 请求的详细信息
 * - 用于审计、调试、安全分析
 * - RequestLogInterceptor 自动写入
 *
 * 关联性：
 * - 被 LogsService 用于数据库 CRUD
 * - 被 RequestLogInterceptor 写入日志
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

/**
 * @Entity('action_logs')
 * @description 声明为 TypeORM 实体，映射 action_logs 表
 */
@Entity('action_logs')
export class ActionLog {
  /**
   * 主键
   * @description 自增主键，唯一标识每条日志
   */
  @PrimaryGeneratedColumn()
  id!: number;

  /**
   * 用户 ID
   * @description 执行操作的用户 ID
   * - 字符串类型，支持多种 ID 格式
   * - anonymous 表示未登录用户
   */
  @Column({ type: 'varchar' })
  userId!: string;

  /**
   * 操作类型
   * @description 格式如 "POST:/api/auth/login"
   * - 包含 HTTP 方法和路由
   * - 用于分类和筛选日志
   */
  @Column({ type: 'varchar' })
  action!: string;

  /**
   * HTTP 方法
   * @description GET/POST/PATCH/DELETE 等
   * - 可为空（某些请求可能没有）
   */
  @Column({ type: 'varchar', nullable: true })
  method!: string | null;

  /**
   * 请求路径
   * @description 完整的请求 URL 路径
   * - 可为空
   */
  @Column({ type: 'varchar', nullable: true })
  path!: string | null;

  /**
   * 请求体
   * @description HTTP 请求的 body 内容
   * - JSON 字符串格式
   * - 可为空（如 GET 请求）
   */
  @Column({ type: 'text', nullable: true })
  requestBody!: string | null;

  /**
   * 响应体
   * @description HTTP 响应的 body 内容
   * - JSON 字符串格式
   * - 记录返回数据或错误信息
   */
  @Column({ type: 'text', nullable: true })
  responseBody!: string | null;

  /**
   * HTTP 状态码
   * @description 响应状态码
   * - 200 表示成功
   * - 401/403/500 表示错误
   */
  @Column({ type: 'int', nullable: true })
  statusCode!: number | null;

  /**
   * 客户端 IP
   * @description 请求来源的 IP 地址
   * - 可用于地理位置分析
   * - 可为空
   */
  @Column({ type: 'varchar', nullable: true })
  ip!: string | null;

  /**
   * 创建时间
   * @description 日志记录创建的时间
   * - 自动设置为当前时间
   * - 用于排序和过期清理
   */
  @CreateDateColumn()
  createdAt!: Date;
}