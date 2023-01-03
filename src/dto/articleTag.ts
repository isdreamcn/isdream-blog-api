import { Rule, RuleType } from '@midwayjs/validate';

export class ArticleTagDTO {
  @Rule(RuleType.string().required())
  title: string;

  @Rule(RuleType.string())
  description?: string;

  @Rule(
    RuleType.string()
      .pattern(new RegExp('^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'))
      .required()
      .error(new Error('color只能是一个16进制颜色'))
  )
  color: string;
}
