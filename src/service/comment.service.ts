import { Inject, Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../entity/comment';
import { ArticleService } from './article.service';
import { UserService } from './user.service';
import {
  FieldRequiredError,
  NotFountHttpError,
  ParameterError,
} from '../error/custom.error';

export interface ICommentData
  extends Partial<Omit<Comment, 'article' | 'user' | 'parentComment'>> {
  article?: number;
  user?: number;
  parentComment?: number;
}

@Provide()
export class CommentService {
  @InjectEntityModel(Comment)
  commentModel: Repository<Comment>;

  @Inject()
  articleService: ArticleService;

  @Inject()
  userService: UserService;

  async findComment(id: number) {
    const comment = await this.commentModel.findOne({
      where: {
        id,
      },
      relations: ['article', 'user', 'parentComment'],
    });

    if (!comment) {
      throw new NotFountHttpError(`id为${id}的评论不存在`);
    }

    return comment;
  }

  async createComment({ content, article, user, parentComment }: ICommentData) {
    if (article === undefined) {
      throw new FieldRequiredError('article');
    }

    if (user === undefined) {
      throw new FieldRequiredError('user');
    }

    const _article = await this.articleService.findArticle(article);
    const _user = await this.userService.findUser(user);
    const _parentComment = parentComment
      ? await this.findComment(parentComment)
      : undefined;

    if (_parentComment && _parentComment.parentComment) {
      throw new ParameterError('只能回复一级评论');
    }

    return await this.commentModel.save({
      content,
      article: _article,
      user: _user,
      parentComment: _parentComment,
    });
  }

  async deleteComment(id: number) {
    const comment = await this.findComment(id);
    return await this.commentModel.softRemove(comment);
  }

  async findCommentList(
    page: number,
    pageSize: number,
    q: string,
    approved?: boolean
  ) {
    let queryBuilder = this.commentModel
      .createQueryBuilder('comment')
      .where('comment.comment LIKE :comment')
      .setParameters({
        comment: `%${q}%`,
      });
    if (approved !== undefined) {
      queryBuilder = queryBuilder.andWhere(`comment.approved=${approved}`);
    }

    const data = await queryBuilder
      .addOrderBy('comment.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();
    const count = await queryBuilder.getCount();

    return {
      data,
      count,
    };
  }

  async approveComment(id: number) {
    const comment = await this.findComment(id);
    return await this.commentModel.save({
      ...comment,
      approved: true,
    });
  }

  async findCommentReply(
    page: number,
    pageSize: number,
    parentComment: number
  ) {
    const queryBuilder = this.commentModel
      .createQueryBuilder('commnet')
      .where('commnet.parentComment = :parentComment')
      .setParameters({
        parentComment,
      });

    const data = await queryBuilder
      .select(['id', 'content'])
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getRawMany();

    const count = await queryBuilder.getCount();

    return {
      data,
      count,
    };
  }

  async findCommentMain(page: number, pageSize: number, article?: number) {
    if (article === undefined) {
      throw new FieldRequiredError('article');
    }

    const queryBuilder = this.commentModel
      .createQueryBuilder('commnet')
      .where('commnet.approved = 1 AND commnet.parentComment IS NULL')
      .andWhere('commnet.article = :article')
      .setParameters({
        article,
      });
    const data = await queryBuilder
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
