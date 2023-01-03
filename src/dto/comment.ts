import { Rule, RuleType, OmitDto } from '@midwayjs/validate';
import { CommonFindListDTO } from './common';

export class CommentDTO {
  @Rule(RuleType.string().required())
  content: string;

  @Rule(RuleType.number().required())
  article: number;

  @Rule(RuleType.number())
  parentComment?: number;
}

export class CommentFindListDTO extends CommonFindListDTO {
  @Rule(RuleType.boolean())
  approved?: boolean;
}

export class CommentFindMainDTO extends OmitDto(CommonFindListDTO, ['q']) {
  // 1 按热度（likedCount）2 按时间
  @Rule(RuleType.number().valid(1, 2).default(1))
  sort?: number;

  @Rule(RuleType.number().required())
  article: number;
}

export class CommentFindReplyDTO extends OmitDto(CommentFindMainDTO, [
  'article',
]) {
  @Rule(RuleType.number().required())
  parentComment: number;
}
