import { IMiddleware } from '@midwayjs/core';
import { Middleware } from '@midwayjs/decorator';
import { NextFunction, Context } from '@midwayjs/koa';

@Middleware()
export class FormatMiddleware implements IMiddleware<Context, NextFunction> {
  public static getName(): string {
    return 'format';
  }

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const result = await next();
      return {
        code: 200,
        message: 'OK',
        ...result,
      };
    };
  }

  match(ctx: Context) {
    if (ctx.path.indexOf('/file/') !== -1 && ctx.method === 'GET') {
      return false;
    }

    return ctx.path.indexOf(process.env.KOA_GLOBAL_PREFIX) !== -1;
  }
}
