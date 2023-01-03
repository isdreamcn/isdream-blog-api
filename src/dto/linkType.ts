import { Rule, RuleType } from '@midwayjs/validate';

export class LinkTypeDTO {
  @Rule(RuleType.string().required())
  title: string;

  @Rule(RuleType.string().required())
  description: string;
}
