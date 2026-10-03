import { Configuration, App } from '@midwayjs/decorator';
import * as koa from '@midwayjs/koa';
import * as orm from '@midwayjs/typeorm';
import * as jwt from '@midwayjs/jwt';
import * as dotenv from 'dotenv';
import * as validate from '@midwayjs/validate';
import * as info from '@midwayjs/info';
import * as upload from '@midwayjs/upload';
import * as crossDomain from '@midwayjs/cross-domain';
import { join } from 'path';
import { readFileSync, existsSync } from 'fs';
import { DefaultErrorFilter } from './filter/default.filter';
import { NotFoundFilter } from './filter/notfound.filter';
import { ReportMiddleware } from './middleware/report.middleware';
import { FormatMiddleware } from './middleware/format.middleware';
import { JwtMiddleware } from './middleware/jwt.middleware';
import { AuthGuard } from './guard/auth.guard';

// 不限制监听数量
require('events').EventEmitter.defaultMaxListeners = 0;

// load .env file
dotenv.config();
const envPath = join(__dirname, `../.env.${process.env.CURRENT_ENV}`);
if (existsSync(envPath)) {
  const config = dotenv.parse(readFileSync(envPath));
  for (const k in config) {
    process.env[k] = config[k];
  }
}

@Configuration({
  imports: [
    koa,
    orm,
    jwt,
    validate,
    upload,
    crossDomain,
    {
      component: info,
      enabledEnvironment: ['local'],
    },
  ],
  importConfigs: [join(__dirname, './config')],
})
export class ContainerLifeCycle {
  @App()
  app: koa.Application;

  async onReady() {
    // media 转存链路（头像/友链图标/编辑器配图）的必备配置缺失时启动期失败，
    // 不留「首个上传请求才报错」的隐雷；缺失键名一并列出便于排障
    const mediaRequiredKeys = [
      'MEDIA_TOKEN_URL',
      'MEDIA_API_BASE',
      'MEDIA_CLIENT_ID',
      'MEDIA_CLIENT_SECRET',
    ];
    const missing = mediaRequiredKeys.filter(k => !process.env[k]);
    if (missing.length > 0) {
      throw new Error(
        `media-api 转存配置缺失: ${missing.join(
          ', '
        )}，请参照 .env.example 补齐`
      );
    }

    // add middleware
    this.app.useMiddleware([ReportMiddleware, JwtMiddleware, FormatMiddleware]);
    // add filter
    this.app.useFilter([NotFoundFilter, DefaultErrorFilter]);
    // add guard
    this.app.useGuard([AuthGuard]);
  }
}
