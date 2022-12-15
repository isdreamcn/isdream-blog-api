/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { Comment } from './comment';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  username: string;

  @Column({
    nullable: true,
  })
  avatar: string;

  @Column({
    nullable: true,
  })
  website: string;

  @CreateDateColumn({
    type: 'timestamp',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  updatedAt: Date;

  @DeleteDateColumn({
    type: 'timestamp',
    select: false,
  })
  deletedAt: Date;

  @OneToMany(type => Comment, comment => comment.user)
  comments: Comment[];

  @ManyToMany(type => Comment, comment => comment.likedUsers)
  likedComments: Comment[];
}
