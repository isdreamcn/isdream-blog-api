import { Rule } from '@midwayjs/validation';
import * as RuleType from 'joi';

export class CommonFindListDTO {
  @Rule(RuleType.number().min(1).default(1))
  page?: number;

  @Rule(RuleType.number().min(1).default(10))
  pageSize?: number;

  @Rule(RuleType.string().default(''))
  q?: string;
}
