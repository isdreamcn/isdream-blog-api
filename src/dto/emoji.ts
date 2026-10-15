import { Rule } from '@midwayjs/validation';
import * as RuleType from 'joi';
import { CommonFindListDTO } from '../dto/common';
export class EmojiDTO {
  @Rule(RuleType.string().required())
  placeholder: string;

  @Rule(RuleType.string())
  description?: string;

  @Rule(RuleType.number())
  file?: number;

  @Rule(RuleType.number().required())
  type: number;
}

export class EmojiFindListDTO extends CommonFindListDTO {
  @Rule(RuleType.number())
  type?: number;
}
