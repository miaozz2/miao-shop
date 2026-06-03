/**
 * 数据库模块
 *
 * 为什么单独作为模块：
 * - 隔离数据库连接配置，便于单独维护
 * - 其他模块只需导入 TypeOrmModule.forFeature() 即可使用 Entity
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
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.name'),
        autoLoadEntities: true,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
