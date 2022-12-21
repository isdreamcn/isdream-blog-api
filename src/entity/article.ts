/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Comment } from './comment';
import { ArticleTag } from './articleTag';

@Entity()
export class Article {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({
    nullable: true,
  })
  cover: string;

  @Column('text')
  content: string;

  @Column({
    type: 'double',
    default: 0,
  })
  views: number;

  @Column({
    default: true,
  })
  isCommented: boolean;

  @Column({
    default: false,
  })
  isTop: boolean;

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

  @OneToMany(type => Comment, comment => comment.article)
  comments: Comment[];

  @ManyToMany(type => ArticleTag, articleTag => articleTag.articles)
  @JoinTable()
  tags: ArticleTag[];
}
