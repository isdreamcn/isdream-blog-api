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
          // algorithms 显式声明（RFC 8725 §3.1）：签发即 HS256，拒绝其他算法的令牌
          ctx.user = this.jwtService.verifySync(token, {
            algorithms: ['HS256'],
          });
        } catch (error) {
          return await next();
        }
        return await next();
      }
    };
  }
}
