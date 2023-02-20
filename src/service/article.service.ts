import { Inject, Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { Article } from '../entity/article';
import { ArticleDTO, ArticleFindMainDTO } from '../dto/article';
import { CommonFindListDTO } from '../dto/common';
import { NotFountHttpError } from '../error/custom.error';
import { ArticleTagService } from './articleTag.service';
import { FileService } from './file.service';
import { htmlToText } from '../utils/format';

@Provide()
export class ArticleService {
  @InjectEntityModel(Article)
  articleModel: Repository<Article>;

  @Inject()
  articleTagService: ArticleTagService;

  @Inject()
  fileService: FileService;

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
      relations: ['tags', 'cover'],
      select: [
        'id',
        'title',
        'content',
        'render',
        'views',
        'commends',
        'isCommented',
        'isTop',
        'createdAt',
        'updatedAt',
      ],
    });
    if (!article) {
      throw new NotFountHttpError(`id为${id}的文章不存在`);
    }
    return article;
  }

  async findArticlePrev(id: number) {
    return await this.articleModel.findOne({
      select: ['id', 'title', 'createdAt'],
      relations: ['cover'],
      where: {
        id: LessThan(id),
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findArticleNext(id: number) {
    return await this.articleModel.findOne({
      select: ['id', 'title'],
      relations: ['cover'],
      where: {
        id: MoreThan(id),
      },
    });
  }

  async createArticle({
    title,
    content,
    render,
    isCommented,
    isTop,
    tags,
    cover,
  }: ArticleDTO) {
    const _tags = await this.articleTagService.findArticleTags(tags);
    const _cover = cover ? await this.fileService.findFile(cover) : undefined;

    return await this.articleModel.save({
      title,
      content,
      text: htmlToText(content),
      render,
      isCommented,
      isTop,
      tags: _tags,
      cover: _cover,
    });
  }

  async deleteArticle(id: number) {
    const article = await this.findArticle(id);
    // 移除tags关联
    article.tags = [];
    return await this.articleModel.softRemove(article);
  }

  async updateArticle(
    id: number,
    { title, content, render, isCommented, isTop, tags, cover }: ArticleDTO
  ) {
    const article = await this.findArticle(id);
    const _tags = await this.articleTagService.findArticleTags(tags);
    const _cover = cover ? await this.fileService.findFile(cover) : undefined;

    return await this.articleModel.save({
      ...article,
      title,
      content,
      text: htmlToText(content),
      render,
      isCommented,
      isTop,
      tags: _tags,
      cover: _cover,
    });
  }

  async commendArticle(id: number) {
    const article = await this.findArticle(id);
    return await this.articleModel.save({
      ...article,
      commends: article.commends + 1,
    });
  }

  async findArticleList({ page, pageSize, q }: CommonFindListDTO) {
    const queryBuilder = this.articleModel
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.tags', 'tag')
      .leftJoinAndSelect('article.cover', 'cover')
      .where('article.title LIKE :title OR article.text LIKE :content')
      .setParameters({
        title: `%${q}%`,
        content: `%${q}%`,
      });

    const data = await queryBuilder
      .orderBy('article.isTop', 'DESC')
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

  async findArticleMain({ page, pageSize, q, tag }: ArticleFindMainDTO) {
    let queryBuilder = this.articleModel
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.tags', 'tag')
      .leftJoinAndSelect('article.cover', 'cover')
      .loadRelationCountAndMap('article.comments', 'article.comments')
      .where('(article.title LIKE :title OR article.text LIKE :content)')
      .setParameters({
        title: `%${q}%`,
        content: `%${q}%`,
      });

    if (tag) {
      queryBuilder = queryBuilder.andWhere('tag.id = :tag', {
        tag,
      });
    }

    const data = await queryBuilder
      .orderBy('article.isTop', 'DESC')
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

  async articleTop(id: number) {
    const article = await this.findArticle(id);
    return await this.articleModel.save({
      id,
      isTop: !article.isTop,
    });
  }

  async articleCommented(id: number) {
    const article = await this.findArticle(id);
    return await this.articleModel.save({
      id,
      isCommented: !article.isCommented,
    });
  }
}
