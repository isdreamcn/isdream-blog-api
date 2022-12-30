# isdream-blog-api

## 生成私钥
- 进入 ./keys
- 执行
```bash
ssh-keygen -t rsa -b 2048 -f private.key
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
