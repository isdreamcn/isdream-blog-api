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
import { Validate } from '@midwayjs/validate';
import { Role } from '../decorator/role.decorator';
import { ArticleDTO, ArticleFindMainDTO } from '../dto/article';
import { CommonFindListDTO } from '../dto/common';
import { ArticleService } from '../service/article.service';

@Controller('/article')
export class ArticleController {
  @Inject()
  articleService: ArticleService;

  @Post()
  @Validate()
  async createArticle(@Body() article: ArticleDTO) {
    await this.articleService.createArticle(article);
  }

  @Del('/:id')
  async deleteArticle(@Param('id') id: number) {
    await this.articleService.deleteArticle(id);
  }

  @Put('/:id')
  @Validate()
  async updateArticle(@Param('id') id: number, @Body() article: ArticleDTO) {
    await this.articleService.updateArticle(id, article);
  }

  @Role(['pc'])
  @Post('/commend/:id')
  async commendArticle(@Param('id') id: number) {
    await this.articleService.commendArticle(id);
  }

  @Role(['pc'])
  @Get('/:id')
  async findArticle(@Param('id') id: number) {
    const data = await this.articleService.findArticle(id);
    await this.articleService.addArticleViews(id);
    return {
      data,
    };
  }

  @Get()
  @Validate()
  async findArticleList(@Query() query: CommonFindListDTO) {
    return await this.articleService.findArticleList(query);
  }

  @Role(['pc'])
  @Get('/main')
  @Validate()
  async findArticleMain(@Query() query: ArticleFindMainDTO) {
    return await this.articleService.findArticleMain(query);
  }
}
