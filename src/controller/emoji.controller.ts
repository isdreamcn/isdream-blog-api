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
import { EmojiService } from '../service/emoji.service';
import { EmojiDTO } from '../dto/emoji';
import { CommonFindListDTO } from '../dto/common';

@Controller('/emoji')
export class EmojiController {
  @Inject()
  emojiService: EmojiService;

  @Post()
  @Validate()
  async createEmoji(@Body() emoji: EmojiDTO) {
    await this.emojiService.createEmoji(emoji);
  }

  @Del('/:id')
  async deleteEmoji(@Param('id') id: number) {
    await this.emojiService.deleteEmoji(id);
  }

  @Put('/:id')
  @Validate()
  async updateEmoji(@Param('id') id: number, @Body() emoji: EmojiDTO) {
    await this.emojiService.updateEmoji(id, emoji);
  }

  @Get('/:id')
  async findEmoji(@Param('id') id: number) {
    const data = await this.emojiService.findEmoji(id);
    return {
      data,
    };
  }

  @Get()
  @Validate()
  async findEmojiList(@Query() query: CommonFindListDTO) {
    return await this.emojiService.findEmojiList(query);
  }
}
