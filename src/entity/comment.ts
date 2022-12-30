import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { User } from './user';
import { Article } from './article';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @Column({
    default: false,
  })
  approved: boolean;

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

  @ManyToOne(() => User, user => user.comments, {
    nullable: false,
  })
  @JoinColumn()
  user: User;

  @ManyToOne(() => Article, article => article.comments, {
    nullable: false,
  })
  @JoinColumn()
  article: Article;

  @ManyToOne(() => Comment, comment => comment.replies)
  @JoinColumn()
  parentComment: Comment;

  @OneToMany(() => Comment, comment => comment.parentComment)
  replies: Comment[];

  @ManyToMany(() => User, user => user.likedComments, {
    cascade: true,
  })
  @JoinTable()
  likedUsers: User[];
}
