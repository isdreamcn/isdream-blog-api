import {
  Body,
  Controller,
  Del,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
} from '@midwayjs/core';
import { ArticleTag } from '../entity/articleTag';
import { ArticleTagService } from '../service/articleTag.service';

@Controller('/article_tag')
export class articleTagController {
  @Inject()
  articleTagService: ArticleTagService;

  @Post()
  async createArticleTag(@Body() articleTag: ArticleTag) {
    await this.articleTagService.createArticleTag(articleTag);
  }

  @Del('/:id')
  async deleteArticleTag(@Param('id') id: number) {
    await this.articleTagService.deleteArticleTag(id);
  }

  @Put('/:id')
  async updateArticleTag(
    @Param('id') id: number,
    @Body() articleTag: ArticleTag
  ) {
    await this.articleTagService.updateArticleTag(id, articleTag);
  }

  @Get('/:id')
  async findArticleTag(@Param('id') id: number) {
    const data = await this.articleTagService.findArticleTag(id);
    return {
      data,
    };
  }

  @Get()
  async findArticleTagList(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
    @Query('q') q = ''
  ) {
    return await this.articleTagService.findArticleTagList(page, pageSize, q);
  }

  @Get('/all')
  async findArticleTagAll() {
    const data = await this.articleTagService.findArticleTagAll();
    return {
      data,
    };
  }
}
