# isdream-blog-api

## 1.HS256 secret

- 生成 HS256 secret
- 保存到 .env HS256_SECRET

```bash
# 生成 32 字节随机密钥，Base64URL 编码（HS256 secret）
openssl rand -base64 32 | tr '+/' '-_' | tr -d '='
```

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
