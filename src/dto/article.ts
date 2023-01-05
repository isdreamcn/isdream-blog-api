import { Rule, RuleType } from '@midwayjs/validate';

export class ArticleDTO {
  @Rule(RuleType.string().required())
  title: string;

  @Rule(RuleType.number())
  cover?: number;

  @Rule(RuleType.string().required())
  content: string;

  @Rule(RuleType.boolean())
  isCommented?: boolean;

  @Rule(RuleType.boolean())
  isTop?: boolean;

  @Rule(RuleType.array().items(RuleType.number()))
  tags?: number[];
}
