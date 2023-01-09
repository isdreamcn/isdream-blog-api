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
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Comment } from './comment';
import { ArticleTag } from './articleTag';
import { File } from './file';

@Entity()
export class Article {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  title: string;

  @Index({ fulltext: true })
  @Column('text')
  content: string;

  @Column({
    default: 1,
    comment: '1-markdown、2-富文本',
  })
  render: number;

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

  @ManyToOne(() => File, {
    nullable: true,
  })
  @JoinColumn()
  cover: File;

  @OneToMany(() => Comment, comment => comment.article)
  comments: Comment[];

  @ManyToMany(() => ArticleTag, articleTag => articleTag.articles, {
    cascade: true,
  })
  @JoinTable()
  tags: ArticleTag[];
}
