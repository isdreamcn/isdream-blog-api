import { MidwayConfig } from '@midwayjs/core';
import { join } from 'path';
import { readFileSync } from 'fs';

export default {
  // use for cookie sign key, should change to your own and keep security
  keys: '1670827585510_1877',
  koa: {
    port: 7001,
    globalPrefix: '/v1',
  },
  jwt: {
    secret: readFileSync(join(__dirname, '../../keys/private.key')) as any,
    expiresIn: '30d', // https://github.com/vercel/ms
  },
  typeorm: {
    dataSource: {
      default: {
        /**
         * 单数据库实例
         */
        type: 'mysql',
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
        username: process.env.MYSQL_USERNAME,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        synchronize: true, // 如果第一次使用，不存在表，有同步的需求可以写 true
        logging: false,

        // 配置实体模型 或者 entities: '/entity',
        entities: '/entity',
      },
    },
  },
} as MidwayConfig;
