import {
  Controller,
  Inject,
  Body,
  Del,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@midwayjs/decorator';
import { ArticleService, IArticleData } from '../service/article.service';
import { Role } from '../decorator/role.decorator';

@Controller('/article')
export class ArticleController {
  @Inject()
  articleService: ArticleService;

  @Post()
  async createArticle(@Body() article: IArticleData) {
    await this.articleService.createArticle(article);
  }

  @Del('/:id')
  async deleteArticle(@Param('id') id: number) {
    await this.articleService.deleteArticle(id);
  }

  @Put('/:id')
  async updateArticle(@Param('id') id: number, @Body() article: IArticleData) {
    await this.articleService.updateArticle(id, article);
  }

  @Role(['pc'])
  @Get('/:id')
  async findArticle(@Param('id') id: number) {
    await this.articleService.addArticleViews(id);
    const data = await this.articleService.findArticle(id);
    return {
      data,
    };
  }

  @Role(['pc'])
  @Get()
  async findArticleList(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
    @Query('q') q = ''
  ) {
    return await this.articleService.findArticleList(page, pageSize, q);
  }
}
