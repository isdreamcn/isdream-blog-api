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

interface IFindCommentMainData {
  page: number;
  pageSize: number;
  sort: number;
  user?: number;
  article?: number;
}
interface IFindCommentReplyData extends IFindCommentMainData {
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
      relations: [
        'article',
        'user',
        'parentComment',
        'likedUsers',
        'dislikedUsers',
      ],
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

  async findCommentLikedAndDisliked(comment: number, user: number) {
    const liked = await this.commentModel
      .createQueryBuilder('comment')
      .leftJoin('comment.likedUsers', 'likedUser')
      .where('comment.id = :comment AND likedUser.id = :user', {
        comment,
        user,
      })
      .getOne();

    const disliked = await this.commentModel
      .createQueryBuilder('comment')
      .leftJoin('comment.dislikedUsers', 'dislikedUser')
      .where('comment.id = :comment AND dislikedUser.id = :user', {
        comment,
        user,
      })
      .getOne();

    return {
      liked: !!liked,
      disliked: !!disliked,
    };
  }

  async findCommentReply({
    page,
    pageSize,
    sort,
    parentComment,
    user,
    article,
  }: IFindCommentReplyData) {
    let queryBuilder = this.commentModel
      .createQueryBuilder('comment')
      .where('comment.approved = 1');

    queryBuilder = queryBuilder.andWhere(
      parentComment
        ? 'comment.parentComment = :parentComment'
        : 'comment.parentComment IS NUll',
      {
        parentComment,
      }
    );

    if (article) {
      queryBuilder.andWhere('comment.article = :article', {
        article,
      });
    }

    const count = await queryBuilder.getCount();

    queryBuilder = queryBuilder
      .loadRelationCountAndMap('comment.likedCount', 'comment.likedUsers')
      .leftJoinAndSelect('comment.user', 'user')
      .addSelect('COUNT(likedUser.id) as likedCount')
      .leftJoin('comment.likedUsers', 'likedUser')
      .groupBy('comment.id');

    if (sort === 1) {
      queryBuilder = queryBuilder.orderBy('likedCount', 'DESC');
    } else if (sort === 2) {
      queryBuilder = queryBuilder.orderBy('comment.createdAt', 'DESC');
    }

    let data = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    if (user) {
      data = await Promise.all(
        data.map(async item => {
          const res = await this.findCommentLikedAndDisliked(item.id, user);
          return {
            ...item,
            ...res,
          };
        })
      );
    }

    return {
      data,
      count,
    };
  }

  async findCommentMain({
    page,
    pageSize,
    sort,
    article,
    user,
  }: IFindCommentMainData) {
    if (article === undefined) {
      throw new FieldRequiredError('article');
    }

    const { data: _data, count } = await this.findCommentReply({
      page,
      pageSize,
      sort,
      user,
      article,
    });

    const data = await Promise.all(
      _data.map(async item => {
        const replys = await this.findCommentReply({
          page: 1,
          pageSize: 2,
          sort,
          parentComment: item.id,
          user,
        });
        return {
          ...item,
          replys,
        };
      })
    );

    return {
      data,
      count,
    };
  }

  async commentLike(id: number, userId: number) {
    const comment = await this.findComment(id);
    comment.dislikedUsers = comment.dislikedUsers.filter(
      user => user.id !== userId
    );
    let user = comment.likedUsers.find(user => user.id === userId);
    if (!user) {
      user = await this.userService.findUser(userId);
      comment.likedUsers.push(user);
    }
    return await this.commentModel.save(comment);
  }

  async commentDislike(id: number, userId: number) {
    const comment = await this.findComment(id);
    comment.likedUsers = comment.likedUsers.filter(user => user.id !== userId);
    let user = comment.dislikedUsers.find(user => user.id === userId);
    if (!user) {
      user = await this.userService.findUser(userId);
      comment.dislikedUsers.push(user);
    }
    return await this.commentModel.save(comment);
  }
}
