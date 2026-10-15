import { Rule } from '@midwayjs/validation';
import * as RuleType from 'joi';

export class EmojiTypeDTO {
  @Rule(RuleType.string().required())
  title: string;

  @Rule(RuleType.string().required())
  width: string;

  @Rule(RuleType.string().required())
  height: string;
}
