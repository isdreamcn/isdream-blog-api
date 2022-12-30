import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { LinkType } from '../entity/linkType';
import { NotFountHttpError } from '../error/custom.error';

export type ILinkTypeData = Partial<LinkType>;

@Provide()
export class LinkTypeService {
  @InjectEntityModel(LinkType)
  linkTypeModel: Repository<LinkType>;

  async findLinkType(id: number) {
    const linkType = await this.linkTypeModel.findOne({
      where: {
        id,
      },
    });

    if (!linkType) {
      throw new NotFountHttpError(`id为${id}的友联分类不存在`);
    }

    return linkType;
  }

  async createLinkType({ title, description }: ILinkTypeData) {
    return await this.linkTypeModel.save({
      title,
      description,
    });
  }

  async deleteLinkType(id: number) {
    const linkType = await this.findLinkType(id);
    return await this.linkTypeModel.remove(linkType);
  }

  async updateLinkType(id: number, { title, description }: ILinkTypeData) {
    const linkType = await this.findLinkType(id);
    return await this.linkTypeModel.save({
      ...linkType,
      title,
      description,
    });
  }

  async findLinkTypeList(page: number, pageSize: number, q: string) {
    const queryBuilder = this.linkTypeModel
      .createQueryBuilder('linkType')
      .where(
        'linkType.title LIKE :title OR linkType.description LIKE :description'
      )
      .setParameters({
        title: `%${q}%`,
        description: `%${q}%`,
      });

    const data = await queryBuilder
      .addOrderBy('linkType.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();
    const count = await queryBuilder.getCount();

    return {
      data,
      count,
    };
  }

  async findLinkTypeMain() {
    return await this.linkTypeModel
      .createQueryBuilder('linkType')
      .leftJoinAndSelect('linkType.links', 'links', 'links.dead = 0')
      .getMany();
  }

  async findLinkTypeSelect() {
    return await this.linkTypeModel.find({});
  }
}
