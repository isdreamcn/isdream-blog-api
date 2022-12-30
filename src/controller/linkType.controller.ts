import {
  Controller,
  Inject,
  Body,
  Del,
  Param,
  Post,
  Put,
  Get,
  Query,
} from '@midwayjs/decorator';
import { LinkTypeService, ILinkTypeData } from '../service/linkType.service';

@Controller('/link_type')
export class LinkTypeController {
  @Inject()
  linkTypeService: LinkTypeService;

  @Post()
  async createLinkType(@Body() linkType: ILinkTypeData) {
    await this.linkTypeService.createLinkType(linkType);
  }

  @Del('/:id')
  async deleteLinkType(@Param('id') id: number) {
    await this.linkTypeService.deleteLinkType(id);
  }

  @Put('/:id')
  async updateLinkType(
    @Param('id') id: number,
    @Body() linkType: ILinkTypeData
  ) {
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

  @Get('/main')
  async findLinkTypeMain() {
    const data = await this.linkTypeService.findLinkTypeMain();
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
