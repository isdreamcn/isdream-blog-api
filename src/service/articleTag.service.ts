import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { ArticleTag } from '../entity/articleTag';
import { NotFountHttpError } from '../error/custom.error';

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
      throw new NotFountHttpError();
    }

    return articleTag;
  }

  async findArticleTags(ids: number[] = []) {
    return await Promise.all(ids.map(id => this.findArticleTag(id)));
  }

  async createArticleTag({ title, description }: ArticleTag) {
    return await this.articleTagModel.save({
      title,
      description,
    });
  }

  async deleteArticleTag(id: number) {
    const articleTag = await this.findArticleTag(id);
    return await this.articleTagModel.remove(articleTag);
  }

  async updateArticleTag(id: number, { title, description }: ArticleTag) {
    const articleTag = await this.findArticleTag(id);
    return await this.articleTagModel.save({
      ...articleTag,
      title,
      description,
    });
  }

  async findArticleTagList() {
    return await this.articleTagModel
      .createQueryBuilder('articleTag')
      .addSelect('COUNT(article.id) as count')
      .leftJoin('articleTag.articles', 'article')
      .loadRelationCountAndMap('articleTag.articleCount', 'articleTag.articles')
      .groupBy('articleTag.id')
      .orderBy('count', 'DESC')
      .addOrderBy('articleTag.createdAt', 'DESC')
      .getMany();
  }
}
