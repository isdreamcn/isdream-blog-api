# isdream-blog-api

## 1.HS256 secret

- 生成 HS256 secret
- 保存到 .env HS256_SECRET

```bash
# 生成 32 字节随机密钥，Base64URL 编码（HS256 secret）
openssl rand -base64 32 | tr '+/' '-_' | tr -d '='
```

## 2.环境变量

- `.env` 不再纳入版本库，全部键名与说明见 `.env.example`，首次使用 `cp .env.example .env` 后填写
- `MEDIA_TOKEN_URL` / `MEDIA_API_BASE` / `MEDIA_CLIENT_ID` / `MEDIA_CLIENT_SECRET` 四键为 media-api 转存链路必填，缺失时**启动期直接失败**并列出缺失键名
- `OAUTH_API_BASE`：OAuth 登录换牌 / userinfo 的端点基址（末尾带 `/`，本地联调如 `http://localhost:7001/oidc/`）；不配置时走 `isdream-oauth` 库默认生产地址

## 2.1 创建.env.local（可选）

- 与`.env`同级

```bash
# .env.local
NODE_ENV=development
# 配置同.env
```

## 2.2 创建.env.prod（可选）

- 与`.env`同级

```bash
# .env.prod
NODE_ENV=production
# 配置同.env
```

### Development

```bash
npm i
npm run dev
# .env KOA_PORT=7001
open http://localhost:7001/
```

### Deploy

```bash
npm start
```

### npm scripts

- Use `npm run lint` to check code style.
- Use `npm test` to run unit test.

## License

[MIT](https://opensource.org/license/mit/)
Copyright (c) 2022-present isdream.cn
