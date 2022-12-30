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
import { CommentService, ICommentData } from '../service/comment.service';

@Controller('/comment')
export class CommentController {
  @Inject()
  commentService: CommentService;

  @Post()
  async createComment(@Body() comment: ICommentData) {
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

  @Get('/main')
  async findCommentMain(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
    @Query('article') article?: number
  ) {
    return await this.commentService.findCommentMain(page, pageSize, article);
  }

  @Get('/reply')
  async findCommentReply(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
    @Query('parentComment') parentComment?: number
  ) {
    return await this.commentService.findCommentReply(
      page,
      pageSize,
      parentComment
    );
  }
}
