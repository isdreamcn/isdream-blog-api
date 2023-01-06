import { Rule, RuleType } from '@midwayjs/validate';

export class EmojiDTO {
  @Rule(
    RuleType.string()
      .pattern(/^\[.*\]$/)
      .required()
  )
  placeholder: string;

  @Rule(RuleType.string())
  description?: string;

  @Rule(RuleType.number().required())
  file: number;

  @Rule(RuleType.number().required())
  type: number;
}
