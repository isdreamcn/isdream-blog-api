import { HttpStatus, MidwayHttpError } from '@midwayjs/core';

export class NotFountHttpError extends MidwayHttpError {
  constructor(message?: string) {
    super(message ?? '数据不存在', HttpStatus.NOT_FOUND);
  }
}

export class FieldRequiredError extends MidwayHttpError {
  constructor(field) {
    super(`字段${field}必须填写`, HttpStatus.BAD_REQUEST);
  }
}

export class ParameterError extends MidwayHttpError {
  constructor(message: string) {
    super(message ?? '参数错误', HttpStatus.BAD_REQUEST);
  }
}
