import { Configuration, App } from '@midwayjs/decorator';
import * as koa from '@midwayjs/koa';
import * as orm from '@midwayjs/typeorm';
import * as jwt from '@midwayjs/jwt';
import * as dotenv from 'dotenv';
import * as validate from '@midwayjs/validate';
import * as info from '@midwayjs/info';
import { join } from 'path';
import { readFileSync } from 'fs';
import { DefaultErrorFilter } from './filter/default.filter';
import { NotFoundFilter } from './filter/notfound.filter';
import { ReportMiddleware } from './middleware/report.middleware';
import { FormatMiddleware } from './middleware/format.middleware';
import { VerifyRootMiddleware } from './middleware/verifyRoot.middleware';

// load .env file
dotenv.config();
const config = dotenv.parse(
  readFileSync(join(__dirname, `../.env.${process.env.CURRENT_ENV}`))
);
for (const k in config) {
  process.env[k] = config[k];
}

@Configuration({
  imports: [
    koa,
    orm,
    jwt,
    validate,
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
    this.app.useMiddleware([
      ReportMiddleware,
      VerifyRootMiddleware,
      FormatMiddleware,
    ]);
    // add filter
    this.app.useFilter([NotFoundFilter, DefaultErrorFilter]);
  }
}
