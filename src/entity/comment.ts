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

  @ManyToOne(() => User, user => user.comments)
  @JoinColumn()
  user: User;

  @ManyToOne(() => Article, article => article.comments)
  @JoinColumn()
  article: Article;

  @OneToOne(() => Comment)
  @JoinColumn()
  replyComment: Comment;

  @ManyToMany(() => User, user => user.likedComments, {
    cascade: true,
  })
  @JoinTable()
  likedUsers: User[];
}
