import { Rule } from '@midwayjs/validation';
import * as RuleType from 'joi';

export class LinkTypeDTO {
  @Rule(RuleType.string().required())
  title: string;

  @Rule(RuleType.string().required())
  description: string;
}
