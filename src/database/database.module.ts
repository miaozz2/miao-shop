/**
 * 数据库模块 — PostgreSQL 连接配置
 *
 * 为什么单独作为模块：
 * - 隔离数据库连接配置，便于单独维护
 * - 其他模块只需导入 TypeOrmModule.forFeature() 即可使用 Entity
 *
 * 配置项说明：
 * | 配置项              | 来源                  | 说明                    |
 * |-------------------|---------------------|------------------------|
 * | type              | 固定值 'postgres'    | 数据库类型              |
 * | host              | database.host       | 数据库主机地址          |
 * | port              | database.port       | 数据库端口              |
 * | username          | database.username   | 数据库用户名            |
 * | password          | database.password   | 数据库密码              |
 * | database          | database.name       | 数据库名称              |
 * | autoLoadEntities  | 固定值 true          | 自动发现 Entity         |
 * | synchronize       | database.synchronize| 自动同步表结构          |
 * | logging           | database.logging    | SQL 日志输出            |
 *
 * synchronize 策略：
 * - 开发环境 true：Entity 字段变化时自动 ALTER 表结构
 * - 生产环境 false：使用迁移脚本管理表结构变更
 *
 * logging 策略：
 * - 开发环境 true：输出 SQL 语句便于调试
 * - 生产环境 false：关闭日志减少性能开销
 *
 * 关联性：
 * - 被 AppModule 导入
 * - 通过 ConfigService 读取 database.* 配置
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],

      /**
       * useFactory 工厂函数
       * @description 异步配置生成器
       * - 通过 ConfigService 读取环境变量
       * - 返回 TypeORM 连接配置对象
       *
       * @param configService - 配置服务实例
       * - 用于读取 database.* 环境变量
       */
      useFactory: (configService: ConfigService) => ({
        /**
         * 数据库类型
         * @description PostgreSQL 数据库
         */
        type: 'postgres',

        /**
         * 数据库主机
         * @description 数据库服务器地址
         */
        host: configService.get<string>('database.host'),

        /**
         * 数据库端口
         * @description PostgreSQL 默认 5432
         */
        port: configService.get<number>('database.port'),

        /**
         * 数据库用户名
         * @description 连接数据库的用户名
         */
        username: configService.get<string>('database.username'),

        /**
         * 数据库密码
         * @description 连接数据库的密码
         */
        password: configService.get<string>('database.password'),

        /**
         * 数据库名称
         * @description 要连接的数据库名
         */
        database: configService.get<string>('database.name'),

        /**
         * 自动加载实体
         * @description true：自动发现所有 forFeature() 注册的实体
         * - 无需手动在 entities 数组中列出
         * - 每个模块的 TypeOrmModule.forFeature([Entity]) 即注册
         */
        autoLoadEntities: true,

        /**
         * 自动同步表结构
         * @description true：Entity 字段变化时自动 ALTER 表结构
         * - 开发环境：true 方便开发，无需手动迁移
         * - 生产环境：false 必须使用迁移脚本，防止数据丢失
         * - ⚠️ 生产环境务必设为 false
         */
        synchronize: configService.get<boolean>('database.synchronize'),

        /**
         * SQL 日志输出
         * @description true：输出执行的 SQL 语句
         * - 开发环境：true 便于调试和优化 SQL
         * - 生产环境：false 减少日志噪音，提升性能
         */
        logging: configService.get<boolean>('database.logging'),
      }),

      /**
       * 依赖注入
       * @description 声明需要注入的服务
       * - ConfigService 用于读取环境变量
       */
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
