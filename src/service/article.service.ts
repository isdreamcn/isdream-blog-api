import { Inject, Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from '../entity/article';
import { ArticleDTO } from '../dto/article';
import { CommonFindListDTO } from '../dto/common';
import { NotFountHttpError } from '../error/custom.error';
import { ArticleTagService } from './articleTag.service';

@Provide()
export class ArticleService {
  @InjectEntityModel(Article)
  articleModel: Repository<Article>;

  @Inject()
  articleTagService: ArticleTagService;

  async addArticleViews(id: number) {
    const article = await this.findArticle(id);
    article.views++;
    return await this.articleModel.save(article);
  }

  async findArticle(id: number) {
    const article = await this.articleModel.findOne({
      where: {
        id,
      },
      relations: ['tags'],
    });
    if (!article) {
      throw new NotFountHttpError(`id为${id}的文章不存在`);
    }
    return article;
  }

  async createArticle({
    title,
    content,
    isCommented,
    isTop,
    tags,
  }: ArticleDTO) {
    const _tags = await this.articleTagService.findArticleTags(tags);

    return await this.articleModel.save({
      title,
      content,
      isCommented,
      isTop,
      tags: _tags,
    });
  }

  async deleteArticle(id: number) {
    const article = await this.findArticle(id);
    return await this.articleModel.softRemove(article);
  }

  async updateArticle(
    id: number,
    { title, content, isCommented, isTop, tags }: ArticleDTO
  ) {
    const article = await this.findArticle(id);
    const _tags = await this.articleTagService.findArticleTags(tags);

    return await this.articleModel.save({
      ...article,
      title,
      content,
      isCommented,
      isTop,
      tags: _tags,
    });
  }

  async findArticleList({ page, pageSize, q }: CommonFindListDTO) {
    const queryBuilder = this.articleModel
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.tags', 'tag')
      .where('article.title LIKE :title OR article.content LIKE :content')
      .setParameters({
        title: `%${q}%`,
        content: `%${q}%`,
      });

    const data = await queryBuilder
      .orderBy('article.isTop', 'DESC')
      .addOrderBy('article.views', 'DESC')
      .addOrderBy('article.createdAt', 'DESC')
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
