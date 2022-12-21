import { Catch } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';
import { MidwayHttpError } from '@midwayjs/core';

@Catch()
export class DefaultErrorFilter {
  async catch(err: MidwayHttpError | Error, ctx: Context) {
    // 所有的未分类错误会到这里
    const code = err instanceof MidwayHttpError ? err.status ?? 500 : 500;

    try {
      ctx.status = code;
    } catch (error) {
      ctx.status = 500;
    }

    return {
      code,
      message: err.message,
    };
  }
}
