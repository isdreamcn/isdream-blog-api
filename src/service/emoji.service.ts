import { Inject, Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { Emoji } from '../entity/emoji';
import { NotFountHttpError } from '../error/custom.error';
import { EmojiDTO } from '../dto/emoji';
import { CommonFindListDTO } from '../dto/common';
import { FileService } from './file.service';
import { EmojiTypeService } from './emojiType.service';

@Provide()
export class EmojiService {
  @InjectEntityModel(Emoji)
  emojiModel: Repository<Emoji>;

  @Inject()
  fileService: FileService;

  @Inject()
  emojiTypeService: EmojiTypeService;

  async findEmoji(id: number) {
    const emoji = await this.emojiModel.findOne({
      where: {
        id,
      },
      relations: ['file'],
    });

    if (!emoji) {
      throw new NotFountHttpError(`id为${id}的emoji不存在`);
    }

    return emoji;
  }

  async findEmojis(ids: number[]) {
    return await Promise.all(ids.map(async id => await this.findEmoji(id)));
  }

  async createEmoji({ placeholder, description, file, type }: EmojiDTO) {
    const _file = await this.fileService.findFile(file);
    const _type = await this.emojiTypeService.findEmojiType(type);

    return await this.emojiModel.save({
      placeholder,
      description,
      file: _file,
      type: _type,
    });
  }

  async deleteEmoji(id: number) {
    const emoji = await this.findEmoji(id);
    return await this.emojiModel.remove(emoji);
  }

  async updateEmoji(
    id: number,
    { placeholder, description, file, type }: EmojiDTO
  ) {
    const emoji = await this.findEmoji(id);
    const _file = await this.fileService.findFile(file);
    const _type = await this.emojiTypeService.findEmojiType(type);

    return await this.emojiModel.save({
      ...emoji,
      placeholder,
      description,
      file: _file,
      typr: _type,
    });
  }

  async findEmojiList({ page, pageSize, q }: CommonFindListDTO) {
    const queryBuilder = await this.emojiModel
      .createQueryBuilder('emoji')
      .leftJoinAndSelect('emoji.file', 'file')
      .leftJoinAndSelect('emoji.type', 'type')
      .where('emoji.placeholder LIKE :q OR emoji.description LIKE :q')
      .setParameters({
        q: `%${q}%`,
      });

    const data = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();
    const count = await queryBuilder.getCount();

    return {
      data,
      count,
    };
  }
}
