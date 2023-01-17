import { Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Article } from '../entity/article';
import { ArticleTag } from '../entity/articleTag';
import { Comment } from '../entity/comment';
import { Repository } from 'typeorm';

@Provide()
export class StatisticService {
  @InjectEntityModel(Article)
  articleModel: Repository<Article>;

  @InjectEntityModel(ArticleTag)
  articleTagModel: Repository<ArticleTag>;

  @InjectEntityModel(Comment)
  commentModel: Repository<Comment>;

  async findPigeonhole() {
    const count = await this.articleModel.count();

    const yearData = await this.articleModel
      .createQueryBuilder('article')
      .select('YEAR(article.createdAt)', 'year')
      .groupBy('year')
      .orderBy('year', 'DESC')
      .getRawMany();

    const data = await Promise.all(
      yearData.map(async ({ year }) => {
        const articles = await this.articleModel
          .createQueryBuilder('article')
          .select(['id', 'title', 'createdAt'])
          .where('YEAR(article.createdAt) = :year', { year })
          .orderBy('article.createdAt', 'DESC')
          .getRawMany();

        return {
          year,
          articles,
        };
      })
    );

    return {
      data,
      count,
    };
  }

  async typeTotal() {
    const res: any = await this.articleModel
      .createQueryBuilder('article')
      .select('COUNT(article.views)', 'views')
      .getRawOne();

    const articles = await this.articleModel.count();
    const comments = await this.commentModel.count({
      where: {
        approved: true,
      },
    });
    const articleTags = await this.articleTagModel.count();

    const [lastArticle] = await this.articleModel.find({
      order: {
        createdAt: 'DESC',
      },
      take: 1,
    });

    return {
      views: Number(res.views),
      comments,
      articles,
      articleTags,
      lastTime: lastArticle?.createdAt,
    };
  }

  async findArticlesTrend() {
    return await this.articleModel
      .createQueryBuilder('article')
      .select('DATE_FORMAT(article.createdAt, "%Y-%c")', 'month')
      .addSelect('SUM(article.views)', 'views')
      .addSelect('COUNT(article.id)', 'articles')
      .addSelect('COUNT(comment.id)', 'comments')
      .leftJoin('article.comments', 'comment', 'comment.approved = 1')
      .groupBy('month')
      .orderBy('article.createdAt')
      .getRawMany();
  }
}
