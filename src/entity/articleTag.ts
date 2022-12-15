/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';
import { Article } from './article';

@Entity()
export class ArticleTag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @CreateDateColumn({
    type: 'timestamp',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  updatedAt: Date;

  @ManyToMany(type => Article, article => article.tags)
  articles: Article[];
}
