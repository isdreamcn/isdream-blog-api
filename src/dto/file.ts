import { Rule, RuleType } from '@midwayjs/validate';

const FileFormat = [
  'jpeg',
  'png',
  'webp',
  'gif',
  'jp2',
  'tiff',
  'avif',
  'heif',
  'jxl',
] as const;

export class QueryFileDTO {
  @Rule(RuleType.number())
  w?: number;

  @Rule(RuleType.number())
  h?: number;

  @Rule(RuleType.number().max(100).min(1))
  // 质量
  q?: number;

  @Rule(RuleType.string().valid(...FileFormat))
  // 格式
  f?: typeof FileFormat[number];
}
