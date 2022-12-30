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
import { LinkService, ILinkData } from '../service/link.service';

@Controller('/link')
export class LinkController {
  @Inject()
  linkService: LinkService;

  @Post()
  async createLink(@Body() link: ILinkData) {
    await this.linkService.createLink(link);
  }

  @Put('/:id')
  async updateLink(@Param('id') id: number, @Body() link: ILinkData) {
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
  async findLinkList(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
    @Query('q') q = '',
    @Query('dead') dead?: boolean
  ) {
    return await this.linkService.findLinkList(page, pageSize, q, dead);
  }
}
