import { MidwayConfig } from '@midwayjs/core';
import { uploadWhiteList } from '@midwayjs/upload';
import { join } from 'path';
import { readFileSync } from 'fs';
import { toBoolean } from '../utils';
import { logsPath, uploadTmpdir } from './config.custom';

process.env.MIDWAY_LOGGER_WRITEABLE_DIR = logsPath;

export default {
  // use for cookie sign key, should change to your own and keep security
  keys: '1670827585510_1877',
  koa: {
    port: Number(process.env.KOA_PORT),
    globalPrefix: process.env.KOA_GLOBAL_PREFIX,
  },
  jwt: {
    secret: readFileSync(join(__dirname, '../../keys/private.key')).toString(),
    expiresIn: '30d', // https://github.com/vercel/ms
  },
  midwayLogger: {
    default: {
      dir: logsPath,
      // 写入文本的日志等级
      level: 'warn',
      // 控制台输出的日志等级
      consoleLevel: 'warn',
    },
  },
  typeorm: {
    dataSource: {
      default: {
        /**
         * 单数据库实例
         */
        type: 'mysql',
        host: process.env.MYSQL_HOST,
        port: Number(process.env.MYSQL_PORT),
        username: process.env.MYSQL_USERNAME,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        // 如果第一次使用，不存在表，有同步的需求可以写 true，注意会丢数据
        synchronize: toBoolean(process.env.MYSQL_SYNC),
        logging: false,

        // 配置实体模型
        entities: [
          'entity', // 特定目录
        ],
      },
    },
  },
  upload: {
    // mode: UploadMode, 默认为file，即上传到服务器临时目录，可以配置为 stream
    mode: 'file',
    // fileSize: string, 最大上传文件大小，默认为 10mb
    fileSize: '25mb',
    // whitelist: string[]，文件扩展名白名单
    whitelist: uploadWhiteList,
    // tmpdir: string，上传的文件临时存储路径
    tmpdir: uploadTmpdir,
    // cleanTimeout: number，上传的文件在临时目录中多久之后自动删除，默认为 5 分钟
    cleanTimeout: 5 * 60 * 1000,
    // base64: boolean，设置原始body是否是base64格式，默认为false，一般用于腾讯云的兼容
    base64: false,
  },
  cors: {
    origin: '*',
  },
} as MidwayConfig;
