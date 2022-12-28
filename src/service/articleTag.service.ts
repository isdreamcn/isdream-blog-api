import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { ArticleTag } from '../entity/articleTag';
import { NotFountHttpError } from '../error/custom.error';

export type IArticleTagData = Partial<ArticleTag>;

@Provide()
export class ArticleTagService {
  @InjectEntityModel(ArticleTag)
  articleTagModel: Repository<ArticleTag>;

  async findArticleTag(id: number) {
    const articleTag = await this.articleTagModel.findOne({
      where: {
        id,
      },
    });

    if (!articleTag) {
      throw new NotFountHttpError(`id为${id}的文章标签不存在`);
    }

    return articleTag;
  }

  async findArticleTags(ids: number[] = []) {
    return await Promise.all(ids.map(id => this.findArticleTag(id)));
  }

  async createArticleTag({ title, description, color }: IArticleTagData) {
    return await this.articleTagModel.save({
      title,
      description,
      color,
    });
  }

  async deleteArticleTag(id: number) {
    const articleTag = await this.findArticleTag(id);
    return await this.articleTagModel.remove(articleTag);
  }

  async updateArticleTag(
    id: number,
    { title, description, color }: IArticleTagData
  ) {
    const articleTag = await this.findArticleTag(id);
    return await this.articleTagModel.save({
      ...articleTag,
      title,
      description,
      color,
    });
  }

  async findArticleTagList(page: number, pageSize: number, q: string) {
    const queryBuilder = this.articleTagModel
      .createQueryBuilder('articleTag')
      .where(
        'articleTag.title LIKE :title OR articleTag.description LIKE :description'
      )
      .setParameters({
        title: `%${q}%`,
        description: `%${q}%`,
      });

    const data = await queryBuilder
      .addOrderBy('articleTag.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();
    const count = await queryBuilder.getCount();

    return {
      data,
      count,
    };
  }

  async findArticleTagAll() {
    return await this.articleTagModel
      .createQueryBuilder('articleTag')
      .loadRelationCountAndMap('articleTag.articleCount', 'articleTag.articles')
      .addSelect('COUNT(article.id) as count')
      .leftJoin('articleTag.articles', 'article')
      .groupBy('articleTag.id')
      .orderBy('count', 'DESC')
      .getMany();
  }
}
