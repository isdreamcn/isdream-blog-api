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
import { Validate } from '@midwayjs/validate';
import { Role } from '../decorator/role.decorator';
import {
  CommentDTO,
  CommentFindListDTO,
  CommentFindMainDTO,
  CommentFindReplyDTO,
} from '../dto/comment';
import { CommentService } from '../service/comment.service';

@Controller('/comment')
export class CommentController {
  @Inject()
  commentService: CommentService;

  @Inject()
  ctx: Context;

  @Role(['login'])
  @Post('/')
  @Validate()
  async createComment(@Body() comment: CommentDTO) {
    await this.commentService.createComment(comment, this.ctx.user.id);
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
  @Validate()
  async findCommentList(@Query() query: CommentFindListDTO) {
    return await this.commentService.findCommentList(query);
  }

  // 显示评论
  @Post('/approve/:id')
  async approveComment(@Param('id') id: number) {
    await this.commentService.approveComment(id);
  }

  @Role(['pc'])
  @Get('/main')
  @Validate()
  async findCommentMain(@Query() query: CommentFindMainDTO) {
    return await this.commentService.findCommentMain(query, this.ctx.user?.id);
  }

  @Role(['pc'])
  @Get('/reply')
  @Validate()
  async findCommentReply(@Query() query: CommentFindReplyDTO) {
    return await this.commentService.findCommentReply(query, this.ctx.user?.id);
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
