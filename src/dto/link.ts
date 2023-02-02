import { Rule, RuleType } from '@midwayjs/validate';
import { CommonFindListDTO } from './common';

export class LinkDTO {
  @Rule(RuleType.string().required())
  title: string;

  @Rule(RuleType.string().required())
  description: string;

  @Rule(
    RuleType.string()
      .pattern(new RegExp('^https?://'))
      .required()
      .error(new Error('link必须已http或https开头'))
  )
  link: string;

  @Rule(
    RuleType.string()
      .pattern(new RegExp('^https?://'))
      .required()
      .error(new Error('icon必须已http或https开头'))
  )
  icon: string;

  @Rule(RuleType.number().required())
  type: number;
}

export class LinkFindListDTO extends CommonFindListDTO {
  @Rule(RuleType.number())
  type: number;
}
