import { Rule, RuleType } from '@midwayjs/validate';

export class EmojiTypeDTO {
  @Rule(RuleType.string().required())
  title: string;
}
