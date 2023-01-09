# isdream-blog-api

## 1.生成私钥
- 创建 ./keys
- 进入 ./keys
- 生成私钥
```bash
ssh-keygen -t rsa -b 2048 -f private.key
```

## 2.1 创建.env.dev（可选）
```bash
# .env.dev
NODE_ENV=development
# 配置同.env
```

## 2.2 创建.env.prod（可选）
```bash
# .env.prod
NODE_ENV=production
# 配置同.env
```

### Development

```bash
$ npm i
$ npm run dev
$ open http://localhost:7001/
```

### Deploy

```bash
$ npm start
```

### npm scripts

- Use `npm run lint` to check code style.
- Use `npm test` to run unit test.
