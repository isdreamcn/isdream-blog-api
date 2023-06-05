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
import { SEOService } from '../service/seo.service';

@Controller('/article')
export class ArticleController {
  @Inject()
  articleService: ArticleService;

  @Inject()
  seoService: SEOService;

  @Post()
  @Validate()
  async createArticle(@Body() article: ArticleDTO) {
    const data = await this.articleService.createArticle(article);
    const urlList = [`/article/${data.id}`];
    this.seoService.bing(urlList);
    this.seoService.baidu(urlList);
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

  // 设置/取消置顶
  @Post('/top/:id')
  async articleTop(@Param('id') id: number) {
    await this.articleService.articleTop(id);
  }

  // 允许/禁止评论
  @Post('/commented/:id')
  async articleCommented(@Param('id') id: number) {
    await this.articleService.articleCommented(id);
  }

  @Get('/:id')
  async findArticle(@Param('id') id: number) {
    const data = await this.articleService.findArticle(id);
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

  @Role(['pc'])
  @Get('/main/:id')
  async findArticleDetailsMain(@Param('id') id: number) {
    await this.articleService.addArticleViews(id);
    const data = await this.articleService.findArticle(id);
    const prev = await this.articleService.findArticlePrev(id);
    const next = await this.articleService.findArticleNext(id);
    return {
      data: {
        data,
        prev,
        next,
      },
    };
  }
}
