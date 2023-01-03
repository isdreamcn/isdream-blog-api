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
import { Validate } from '@midwayjs/validate';
import { LinkTypeDTO } from '../dto/linkType';
import { CommonFindListDTO } from '../dto/common';
import { LinkTypeService } from '../service/linkType.service';
import { Role } from '../decorator/role.decorator';

@Controller('/link_type')
export class LinkTypeController {
  @Inject()
  linkTypeService: LinkTypeService;

  @Post()
  @Validate()
  async createLinkType(@Body() linkType: LinkTypeDTO) {
    await this.linkTypeService.createLinkType(linkType);
  }

  @Del('/:id')
  async deleteLinkType(@Param('id') id: number) {
    await this.linkTypeService.deleteLinkType(id);
  }

  @Put('/:id')
  @Validate()
  async updateLinkType(@Param('id') id: number, @Body() linkType: LinkTypeDTO) {
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
  @Validate()
  async findLinkTypeList(@Query() query: CommonFindListDTO) {
    return await this.linkTypeService.findLinkTypeList(query);
  }

  @Role(['pc'])
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
