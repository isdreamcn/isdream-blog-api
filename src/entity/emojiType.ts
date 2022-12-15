/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Emoji } from './emoji';

@Entity()
export class EmojiType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @CreateDateColumn({
    type: 'timestamp',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  updatedAt: Date;

  @OneToMany(type => Emoji, emoji => emoji.type)
  emojis: Emoji[];
}
