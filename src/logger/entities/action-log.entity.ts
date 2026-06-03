/**
 * 操作日志实体
 *
 * 记录所有 HTTP 请求的操作日志
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('action_logs')
export class ActionLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  userId!: string;

  @Column({ type: 'varchar' })
  action!: string;

  @Column({ type: 'varchar', nullable: true })
  method!: string | null;

  @Column({ type: 'varchar', nullable: true })
  path!: string | null;

  @Column({ type: 'text', nullable: true })
  requestBody!: string | null;

  @Column({ type: 'text', nullable: true })
  responseBody!: string | null;

  @Column({ type: 'int', nullable: true })
  statusCode!: number | null;

  @Column({ type: 'varchar', nullable: true })
  ip!: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}
