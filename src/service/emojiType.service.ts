import { Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { EmojiType } from '../entity/emojiType';
import { NotFountHttpError } from '../error/custom.error';
import { EmojiTypeDTO } from '../dto/emojiType';
import { CommonFindListDTO } from '../dto/common';

@Provide()
export class EmojiTypeService {
  @InjectEntityModel(EmojiType)
  emojiTypeModel: Repository<EmojiType>;

  async findEmojiType(id: number) {
    const emojiType = await this.emojiTypeModel.findOne({
      where: {
        id,
      },
    });

    if (!emojiType) {
      throw new NotFountHttpError(`id为${id}的emoji分类不存在`);
    }

    return emojiType;
  }

  async createEmojiType({ title }: EmojiTypeDTO) {
    return await this.emojiTypeModel.save({
      title,
    });
  }

  async deleteEmojiType(id: number) {
    const emojiType = await this.findEmojiType(id);
    return await this.emojiTypeModel.remove(emojiType);
  }

  async updateEmojiType(id: number, { title }: EmojiTypeDTO) {
    const emojiType = await this.findEmojiType(id);
    return await this.emojiTypeModel.save({
      ...emojiType,
      title,
    });
  }

  async findEmojiTypeList({ page, pageSize, q }: CommonFindListDTO) {
    const queryBuilder = this.emojiTypeModel
      .createQueryBuilder('emojiType')
      .where('emojiType.title LIKE :q')
      .setParameters({
        q: `%${q}%`,
      });

    const data = await queryBuilder
      .orderBy('emojiType.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();
    const count = await queryBuilder.getCount();

    return {
      data,
      count,
    };
  }

  async findEmojiTypeSelect() {
    return await this.emojiTypeModel.find({});
  }

  async findEmojiTypeMain() {
    return await this.emojiTypeModel.find({
      relations: ['emojis', 'emojis.file'],
    });
  }
}
