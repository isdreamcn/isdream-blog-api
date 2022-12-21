import { HttpStatus, MidwayHttpError } from '@midwayjs/core';

export class NotFountHttpError extends MidwayHttpError {
  constructor(message?: string) {
    super(message ?? '数据不存在', HttpStatus.NOT_FOUND);
  }
}
