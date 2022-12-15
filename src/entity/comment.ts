/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from './user';
import { Article } from './article';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  comment: string;

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

  @ManyToOne(type => User, user => user.comments)
  @JoinColumn()
  user: User;

  @ManyToOne(type => Article, article => article.comments)
  @JoinColumn()
  article: Article;

  @OneToOne(type => Comment)
  @JoinColumn()
  replyComment: Comment;

  @ManyToMany(type => User, user => user.likedComments)
  @JoinTable()
  likedUsers: User[];
}
