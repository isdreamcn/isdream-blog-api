import { Inject, Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { Emoji } from '../entity/emoji';
import { NotFountHttpError } from '../error/custom.error';
import { EmojiDTO, EmojiFindListDTO } from '../dto/emoji';
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
      relations: ['file', 'type'],
    });

    if (!emoji) {
      throw new NotFountHttpError(`id为${id}的emoji不存在`);
    }

    return emoji;
  }

  async findEmojiByPlaceholder(placeholder?: string) {
    if (!placeholder) {
      return null;
    }

    return await this.emojiModel.findOne({
      where: {
        placeholder,
      },
    });
  }

  async createEmoji({ placeholder, description, file, type }: EmojiDTO) {
    let _file = undefined;
    if (file) {
      _file = await this.fileService.findFile(file);
    }
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
    let _file = undefined;
    if (file) {
      _file = await this.fileService.findFile(file);
    }
    const _type = await this.emojiTypeService.findEmojiType(type);

    return await this.emojiModel.save({
      ...emoji,
      placeholder,
      description,
      file: _file,
      typr: _type,
    });
  }

  async findEmojiList({ page, pageSize, q, type }: EmojiFindListDTO) {
    let queryBuilder = await this.emojiModel
      .createQueryBuilder('emoji')
      .leftJoinAndSelect('emoji.file', 'file')
      .leftJoinAndSelect('emoji.type', 'type')
      .where('(emoji.placeholder LIKE :q OR emoji.description LIKE :q)')
      .setParameters({
        q: `%${q}%`,
      });

    if (type) {
      queryBuilder = queryBuilder.andWhere('emoji.type = :type', { type });
    }

    const data = await queryBuilder
      .orderBy('emoji.createdAt', 'DESC')
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
