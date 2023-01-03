import { OmitDto, Rule, RuleType } from '@midwayjs/validate';

export class UserDTO {
  @Rule(RuleType.string().email().required())
  email: string;

  @Rule(RuleType.string().required())
  username: string;

  @Rule(
    RuleType.string()
      .pattern(new RegExp('^https?://'))
      .error(new Error('avatar必须已http或https开头'))
  )
  avatar?: string;

  @Rule(
    RuleType.string()
      .pattern(new RegExp('^https?://'))
      .error(new Error('website必须已http或https开头'))
  )
  website?: string;
}

export class UserLoginDTO extends OmitDto(UserDTO, ['username']) {
  @Rule(RuleType.string())
  username?: string;
}
