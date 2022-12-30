import { Inject, Middleware } from '@midwayjs/decorator';
import { Context, NextFunction } from '@midwayjs/koa';
import { httpError } from '@midwayjs/core';
import { JwtService } from '@midwayjs/jwt';

interface IRootUser {
  username: string;
  password: string;
}

@Middleware()
export class VerifyRootMiddleware {
  @Inject()
  jwtService: JwtService;

  ignorePathMap: Map<string, string | false>;

  constructor() {
    this.ignorePathMap = new Map();
  }

  public static getName(): string {
    return 'jwt';
  }

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      // 判断下有没有校验信息
      if (!ctx.headers['authorization']) {
        throw new httpError.UnauthorizedError();
      }
      // 从 header 上获取校验信息
      const parts = ctx.get('authorization').trim().split(' ');

      if (parts.length !== 2) {
        throw new httpError.UnauthorizedError();
      }

      const [scheme, token] = parts;

      if (/^Bearer$/i.test(scheme)) {
        try {
          const user: IRootUser = this.jwtService.decodeSync(token) as any;

          if (
            user.username !== process.env.ROOT &&
            user.password !== process.env.ROOT_PASSWORD
          ) {
            throw new httpError.UnauthorizedError();
          }
        } catch (error) {
          throw new httpError.UnauthorizedError();
        }
      }

      await next();
    };
  }

  ignore(ctx: Context): boolean {
    const mapRes = this.ignorePathMap.get(ctx.path);

    if (mapRes === ctx.method) {
      return true;
    } else if (mapRes === false) {
      return false;
    }

    // 前台接口
    const paths = [
      // 文章
      {
        re: /\/article$/,
        method: 'GET',
      },
      {
        re: /\/article\/*$/,
      },
      {
        re: /\/article_tag\/main$/,
      },
      // 友链
      {
        re: /\/link_type\/main$/,
      },
      // 用户
      {
        re: /\/user$/,
        method: 'POST',
      },
      {
        re: /\/user\/*$/,
        method: 'PUT',
      },
      {
        re: /\/user\/login$/,
        method: 'POST',
      },
      // 评论
      {
        re: /\/comment$/,
        method: 'POST',
      },
      {
        re: /\/comment\/main$/,
      },
      {
        re: /\/comment\/reply$/,
      },
    ];

    const ignore = !!paths.find(
      ({ re, method = 'GET' }) => re.test(ctx.path) && method === ctx.method
    );

    this.ignorePathMap.set(ctx.path, ignore ? ctx.method : false);
    return ignore;
  }
}
