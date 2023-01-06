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
import { Validate } from '@midwayjs/validate';
import { EmojiTypeService } from '../service/emojiType.service';
import { EmojiTypeDTO } from '../dto/emojiType';
import { CommonFindListDTO } from '../dto/common';
import { Role } from '../decorator/role.decorator';

@Controller('/emoji_type')
export class EmojiTypeController {
  @Inject()
  emojiTypeService: EmojiTypeService;

  @Post()
  @Validate()
  async createEmojiType(@Body() emojiType: EmojiTypeDTO) {
    await this.emojiTypeService.createEmojiType(emojiType);
  }

  @Del('/:id')
  async deleteEmojiType(@Param('id') id: number) {
    await this.emojiTypeService.deleteEmojiType(id);
  }

  @Put('/:id')
  @Validate()
  async updateEmojiType(
    @Param('id') id: number,
    @Body() emojiType: EmojiTypeDTO
  ) {
    await this.emojiTypeService.updateEmojiType(id, emojiType);
  }

  @Get('/:id')
  async findEmojiType(@Param('id') id: number) {
    const data = await this.emojiTypeService.findEmojiType(id);
    return {
      data,
    };
  }

  @Get()
  @Validate()
  async findEmojiTypeList(@Query() query: CommonFindListDTO) {
    return await this.emojiTypeService.findEmojiTypeList(query);
  }

  @Get('/select')
  async findEmojiTypeSelect() {
    const data = await this.emojiTypeService.findEmojiTypeSelect();
    return {
      data,
    };
  }

  @Role(['pc'])
  @Get('/main')
  async findEmojiTypeMain() {
    const data = await this.emojiTypeService.findEmojiTypeMain();
    return {
      data,
    };
  }
}
