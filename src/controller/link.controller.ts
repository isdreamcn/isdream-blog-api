import {
  Controller,
  Inject,
  Body,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@midwayjs/decorator';
import { Validate } from '@midwayjs/validate';
import { LinkDTO, LinkFindListDTO } from '../dto/link';
import { LinkService } from '../service/link.service';

@Controller('/link')
export class LinkController {
  @Inject()
  linkService: LinkService;

  @Post()
  @Validate()
  async createLink(@Body() link: LinkDTO) {
    await this.linkService.createLink(link);
  }

  @Put('/:id')
  @Validate()
  async updateLink(@Param('id') id: number, @Body() link: LinkDTO) {
    await this.linkService.updateLink(id, link);
  }

  @Get('/:id')
  async findLink(@Param('id') id: number) {
    const data = await this.linkService.findLink(id);
    return {
      data,
    };
  }

  @Get()
  @Validate()
  async findLinkList(@Query() query: LinkFindListDTO) {
    return await this.linkService.findLinkList(query);
  }
}
