import { Inject, Middleware } from '@midwayjs/decorator';
import { Context, NextFunction } from '@midwayjs/koa';
import { JwtService } from '@midwayjs/jwt';

// 解析token
@Middleware()
export class JwtMiddleware {
  @Inject()
  jwtService: JwtService;

  public static getName(): string {
    return 'jwt';
  }

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      // 判断下有没有校验信息
      if (!ctx.headers['authorization']) {
        return await next();
      }
      // 从 header 上获取校验信息
      const parts = ctx.get('authorization').trim().split(' ');

      if (parts.length !== 2) {
        return await next();
      }

      const [scheme, token] = parts;

      if (/^Bearer$/i.test(scheme)) {
        try {
          // 验签失败/过期（错 secret、篡改 payload）不设 ctx.user，维持「无有效凭证即匿名」
          ctx.user = this.jwtService.verifySync(token, {});
        } catch (error) {
          return await next();
        }
        return await next();
      }
    };
  }
}
