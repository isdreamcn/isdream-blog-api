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
  Index,
} from 'typeorm';
import { EmojiType } from './emojiType';
import { File } from './file';

@Entity()
export class Emoji {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({
    unique: true,
  })
  @Column()
  placeholder: string;

  @Column({
    nullable: true,
  })
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

  @OneToOne(() => File, {
    nullable: true,
  })
  @JoinColumn()
  file: File;

  @ManyToOne(() => EmojiType, emojiType => emojiType.emojis, {
    nullable: false,
  })
  @JoinColumn()
  type: EmojiType;
}
