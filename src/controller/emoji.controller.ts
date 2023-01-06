import { Body, Controller, Inject, Post } from '@midwayjs/decorator';
import { Validate } from '@midwayjs/validate';
import { EmojiService } from '../service/emoji.service';
import { EmojiDTO } from '../dto/emoji';
// import { CommonFindListDTO } from '../dto/common';

@Controller('/emoji')
export class EmojiController {
  @Inject()
  emojiService: EmojiService;

  @Post()
  @Validate()
  async createEmoji(@Body() emoji: EmojiDTO) {
    await this.emojiService.createEmoji(emoji);
  }
}
