import {
  Body,
  Controller,
  Del,
  Inject,
  Param,
  Post,
  Put,
  Query,
} from '@midwayjs/core';
import { LinkTypeService } from '../service/linkType.service';
import { LinkType } from '../entity/linkType';
import { Get } from '@midwayjs/decorator';

@Controller('/link_type')
export class LinkTypeController {
  @Inject()
  linkTypeService: LinkTypeService;

  @Post()
  async createLinkType(@Body() linkType: LinkType) {
    await this.linkTypeService.createLinkType(linkType);
  }

  @Del('/:id')
  async deleteLinkType(@Param('id') id: number) {
    await this.linkTypeService.deleteLinkType(id);
  }

  @Put('/:id')
  async updateLinkType(@Param('id') id: number, @Body() linkType: LinkType) {
    await this.linkTypeService.updateLinkType(id, linkType);
  }

  @Get('/:id')
  async findLinkType(@Param('id') id: number) {
    const data = await this.linkTypeService.findLinkType(id);
    return {
      data,
    };
  }

  @Get()
  async findLinkTypeList(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
    @Query('q') q = ''
  ) {
    return await this.linkTypeService.findLinkTypeList(page, pageSize, q);
  }

  @Get('/all')
  async findLinkTypeAll() {
    const data = await this.linkTypeService.findLinkTypeAll();
    return {
      data,
    };
  }

  @Get('/select')
  async findLinkTypeSelect() {
    const data = await this.linkTypeService.findLinkTypeSelect();
    return {
      data,
    };
  }
}
