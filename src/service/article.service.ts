import { Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from '../entity/article';
import { NotFountHttpError } from '../error/custom.error';

@Provide()
export class ArticleService {
  @InjectEntityModel(Article)
  articleModel: Repository<Article>;

  async findArticle(id: number) {
    const article = await this.articleModel.findOne({
      where: {
        id,
      },
      relations: ['tags'],
    });
    if (!article) {
      throw new NotFountHttpError();
    }
    return article;
  }

  async createArticle({ title, content, isCommented, isTop, tags }: Article) {
    return await this.articleModel.save({
      title,
      content,
      isCommented,
      isTop,
      tags,
    });
  }

  async deleteArticle(id: number) {
    const article = await this.findArticle(id);
    return await this.articleModel.softRemove(article);
  }

  async updateArticle(
    id: number,
    { title, content, isCommented, isTop, tags }: Article
  ) {
    const article = await this.findArticle(id);
    return await this.articleModel.save({
      ...article,
      title,
      content,
      isCommented,
      isTop,
      tags,
    });
  }

  async findList(page: number, pageSize: number, q: string) {
    const queryBuilder = await this.articleModel
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.tags', 'tags')
      .where('article.title LIKE :title OR article.content LIKE :content')
      .setParameters({
        title: `%${q}%`,
        content: `%${q}%`,
      });

    const data = await queryBuilder
      .orderBy('article.isTop')
      .addOrderBy('article.views')
      .addOrderBy('article.createdAt')
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
