import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
  OneToMany,
  ManyToMany,
  Index,
} from 'typeorm';
import { Comment } from './comment';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({
    select: false,
  })
  email: string;

  @Index({ unique: true })
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

  @OneToMany(() => Comment, comment => comment.user)
  comments: Comment[];

  @ManyToMany(() => Comment, comment => comment.likedUsers)
  likedComments: Comment[];

  @ManyToMany(() => Comment, comment => comment.dislikedUsers)
  dislikedComments: Comment[];
}
