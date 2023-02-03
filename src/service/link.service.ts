import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Inject } from '@midwayjs/decorator';
import { Repository } from 'typeorm';
import { Link } from '../entity/link';
import { LinkTypeService } from './linkType.service';
import { NotFountHttpError } from '../error/custom.error';
import { LinkDTO, LinkFindListDTO } from '../dto/link';

export interface ILinkData extends Partial<Omit<Link, 'type'>> {
  type?: number;
}

@Provide()
export class LinkService {
  @InjectEntityModel(Link)
  linkModel: Repository<Link>;

  @Inject()
  linkTypeService: LinkTypeService;

  async findLink(id: number) {
    const link = await this.linkModel.findOne({
      where: {
        id,
      },
      relations: ['type'],
    });

    if (!link) {
      throw new NotFountHttpError(`id为${id}的友链不存在`);
    }

    return link;
  }

  async createLink({ title, description, link, icon, type }: LinkDTO) {
    const _type = await this.linkTypeService.findLinkType(type);
    return this.linkModel.save({
      title,
      description,
      link,
      icon,
      type: _type,
    });
  }

  async deleteLink(id: number) {
    const link = await this.findLink(id);
    return await this.linkModel.softRemove(link);
  }

  async updateLink(
    id: number,
    { title, description, link, icon, type }: LinkDTO
  ) {
    const linkEntity = await this.findLink(id);
    const _type = type
      ? await this.linkTypeService.findLinkType(type)
      : undefined;

    return await this.linkModel.save({
      ...linkEntity,
      title,
      description,
      link,
      icon,
      type: _type,
    });
  }

  async findLinkList({ page, pageSize, q, type }: LinkFindListDTO) {
    let queryBuilder = this.linkModel
      .createQueryBuilder('link')
      .leftJoinAndSelect('link.type', 'type')
      .where('(link.title LIKE :title OR link.description LIKE :description)')
      .setParameters({
        title: `%${q}%`,
        description: `%${q}%`,
      });

    if (type !== undefined) {
      queryBuilder = queryBuilder.andWhere('link.type = :type', { type });
    }

    const data = await queryBuilder
      .orderBy('link.createdAt', 'DESC')
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
