import {
  Body,
  Controller,
  Del,
  Get,
  Inject,
  Param,
  Post,
  Query,
} from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';
import { CommentService, ICommentData } from '../service/comment.service';
import { Role } from '../decorator/role.decorator';

@Controller('/comment')
export class CommentController {
  @Inject()
  commentService: CommentService;

  @Inject()
  ctx: Context;

  @Role(['login'])
  @Post('/')
  async createComment(@Body() comment: ICommentData) {
    const user = this.ctx.user;
    comment.user = user.id;

    await this.commentService.createComment(comment);
  }

  @Del('/:id')
  async deleteComment(@Param('id') id: number) {
    await this.commentService.deleteComment(id);
  }

  @Get('/:id')
  async findComment(@Param('id') id: number) {
    const data = await this.commentService.findComment(id);
    return {
      data,
    };
  }

  @Get()
  async findCommentList(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
    @Query('q') q = '',
    @Query('approved') approved?: boolean
  ) {
    return await this.commentService.findCommentList(
      page,
      pageSize,
      q,
      approved
    );
  }

  // 显示评论
  @Post('/approve/:id')
  async approveComment(@Param('id') id: number) {
    await this.commentService.approveComment(id);
  }

  @Role(['pc'])
  @Get('/main')
  async findCommentMain(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
    // 1 按热度（likedCount）2 按时间
    @Query('sort') sort?: number,
    @Query('article') article?: number
  ) {
    return await this.commentService.findCommentMain({
      page,
      pageSize,
      article,
      sort: sort || 1,
      user: this.ctx.user?.id,
    });
  }

  @Role(['pc'])
  @Get('/reply')
  async findCommentReply(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
    // 1 按热度（likedCount）2 按时间
    @Query('sort') sort = 1,
    @Query('parentComment') parentComment?: number
  ) {
    return await this.commentService.findCommentReply({
      page,
      pageSize,
      sort,
      parentComment,
      user: this.ctx.user?.id,
    });
  }

  @Role(['login'])
  @Post('/like/:id')
  async commentLike(@Param('id') id: number) {
    await this.commentService.commentLike(id, this.ctx.user.id);
  }

  @Role(['login'])
  @Post('/dislike/:id')
  async commentDislike(@Param('id') id: number) {
    await this.commentService.commentDislike(id, this.ctx.user.id);
  }
}
