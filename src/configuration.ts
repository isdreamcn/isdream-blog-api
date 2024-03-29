import { Configuration, App } from '@midwayjs/decorator';
import * as koa from '@midwayjs/koa';
import * as orm from '@midwayjs/typeorm';
import * as jwt from '@midwayjs/jwt';
import * as dotenv from 'dotenv';
import * as validate from '@midwayjs/validate';
import * as info from '@midwayjs/info';
import * as upload from '@midwayjs/upload';
import * as crossDomain from '@midwayjs/cross-domain';
import * as axios from '@midwayjs/axios';
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
    axios,
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
    // add middleware
    this.app.useMiddleware([ReportMiddleware, JwtMiddleware, FormatMiddleware]);
    // add filter
    this.app.useFilter([NotFoundFilter, DefaultErrorFilter]);
    // add guard
    this.app.useGuard([AuthGuard]);
  }
}
