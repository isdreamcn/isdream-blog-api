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
import { ArticleTagDTO } from '../dto/articleTag';
import { CommonFindListDTO } from '../dto/common';
import { ArticleTagService } from '../service/articleTag.service';

@Controller('/article_tag')
export class articleTagController {
  @Inject()
  articleTagService: ArticleTagService;

  @Post()
  @Validate()
  async createArticleTag(@Body() articleTag: ArticleTagDTO) {
    await this.articleTagService.createArticleTag(articleTag);
  }

  @Del('/:id')
  async deleteArticleTag(@Param('id') id: number) {
    await this.articleTagService.deleteArticleTag(id);
  }

  @Put('/:id')
  @Validate()
  async updateArticleTag(
    @Param('id') id: number,
    @Body() articleTag: ArticleTagDTO
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
  @Validate()
  async findArticleTagList(@Query() query: CommonFindListDTO) {
    return await this.articleTagService.findArticleTagList(query);
  }

  @Role(['pc'])
  @Get('/main')
  async findArticleTagAll() {
    const data = await this.articleTagService.findArticleTagMain();
    return {
      data,
    };
  }

  @Get('/select')
  async findArticleTagSelect() {
    const data = await this.articleTagService.findArticleTagSelect();
    return {
      data,
    };
  }
}
