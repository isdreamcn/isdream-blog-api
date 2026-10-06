import { createApp, close, createHttpRequest } from '@midwayjs/mock';
import { Framework } from '@midwayjs/koa';

// 取自 .env.local 的 KOA_GLOBAL_PREFIX,凭证与端口也依赖 test 脚本注入的 CURRENT_ENV=local
const prefix = '/v1';

describe('应用冒烟测试', () => {
  it('should GET /v1/statistic/total', async () => {
    const app = await createApp<Framework>();

    // 公开接口(@Role(['pc']))匿名可访问;带前缀路径由 FormatMiddleware 包裹
    // {code, message, ...业务数据}
    const result = await createHttpRequest(app).get(
      `${prefix}/statistic/total`
    );

    expect(result.status).toBe(200);
    expect(result.body.code).toBe(200);
    expect(result.body.message).toBe('OK');
    expect(result.body).toHaveProperty('data');

    await close(app);
  });
});
