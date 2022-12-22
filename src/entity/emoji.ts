import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EmojiType } from './emojiType';

@Entity()
export class Emoji {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: true,
  })
  placeholder: string;

  @Column({
    nullable: true,
  })
  src: string;

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

  @DeleteDateColumn({
    type: 'timestamp',
    select: false,
  })
  deletedAt: Date;

  @ManyToOne(() => EmojiType, emojiType => emojiType.emojis)
  @JoinColumn()
  type: EmojiType;
}
