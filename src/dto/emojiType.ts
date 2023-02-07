import { Rule, RuleType } from '@midwayjs/validate';

export class EmojiTypeDTO {
  @Rule(RuleType.string().required())
  title: string;

  @Rule(RuleType.string().required())
  width: string;

  @Rule(RuleType.string().required())
  height: string;
}
