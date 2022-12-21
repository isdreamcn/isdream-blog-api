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
} from '@midwayjs/decorator';
import { ArticleService } from '../service/article.service';
import { Article } from '../entity/article';

@Controller('/article')
export class ArticleController {
  @Inject()
  articleService: ArticleService;

  @Post()
  async createArticle(@Body() article: Article) {
    await this.articleService.createArticle(article);
  }

  @Del('/:id')
  async deleteArticle(@Param('id') id: number) {
    await this.articleService.deleteArticle(id);
  }

  @Put('/:id')
  async updateArticle(@Param('id') id: number, @Body() article: Article) {
    await this.articleService.updateArticle(id, article);
  }

  @Get()
  async findArticleList(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
    @Query('q') q = ''
  ) {
    return await this.articleService.findList(page, pageSize, q);
  }

  @Get('/:id')
  async findArticle(@Param('id') id: number) {
    const data = await this.articleService.findArticle(id);
    return {
      data,
    };
  }
}
