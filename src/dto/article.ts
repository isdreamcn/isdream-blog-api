import { Rule, RuleType } from '@midwayjs/validate';
import { CommonFindListDTO } from './common';

export class ArticleDTO {
  @Rule(RuleType.string().required())
  title: string;

  @Rule(RuleType.number())
  cover?: number;

  @Rule(RuleType.string().required())
  content: string;

  @Rule(RuleType.number().valid(1, 2))
  render?: number;

  @Rule(RuleType.boolean())
  isCommented?: boolean;

  @Rule(RuleType.boolean())
  isTop?: boolean;

  @Rule(RuleType.array().items(RuleType.number()))
  tags?: number[];
}

export class ArticleFindMainDTO extends CommonFindListDTO {
  @Rule(RuleType.number())
  tag?: number;
}
