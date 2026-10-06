# isdream-blog-api

isdream.cn 博客后端服务,基于 Midway 3(Node.js ≥ 20、TypeScript)+ Koa + TypeORM(MySQL)。

主要能力:

- 文章 / 标签 / 评论 / 表情 / 友链 / 统计等内容管理 API
- OAuth 登录(isdream-oauth 对接 account-api)与 JWT 鉴权
- 文件上传:sharp 压缩多档 webp 后转存 media-api
- SEO 收录推送(bing IndexNow / 百度)

包管理器统一使用 pnpm。

## 1. 环境变量

- `.env` 不再纳入版本库,全部键名与说明见 `.env.example`,首次使用 `cp .env.example .env` 后填写
- `MEDIA_TOKEN_URL` / `MEDIA_API_BASE` / `MEDIA_CLIENT_ID` / `MEDIA_CLIENT_SECRET` 四键为 media-api 转存链路必填,缺失时**启动期直接失败**并列出缺失键名
- `OAUTH_API_BASE`:OAuth 登录换牌 / userinfo 的端点基址(末尾带 `/`,本地联调如 `http://localhost:7001/oidc/`);不配置时走 `isdream-oauth` 库默认生产地址

### 1.1 生成 HS256 secret

保存到 `.env` 的 `HS256_SECRET`:

```bash
# 生成 32 字节随机密钥,Base64URL 编码(HS256 secret)
openssl rand -base64 32 | tr '+/' '-_' | tr -d '='
```

### 1.2 创建 .env.local(可选,本地开发)

与 `.env` 同级。`pnpm dev` 注入 `CURRENT_ENV=local` 时加载,同名键覆盖 `.env`:

```bash
# .env.local
NODE_ENV=development
# 配置同.env
```

### 1.3 创建 .env.prod(可选,构建/宿主部署)

与 `.env` 同级。构建脚本注入 `CURRENT_ENV=prod`,`pnpm start` 的 bootstrap 进程同样置 `CURRENT_ENV=prod`,同名键覆盖 `.env`:

```bash
# .env.prod
NODE_ENV=production
# 配置同.env
```

## 2. 开发与宿主部署

### 2.1 本地开发

```bash
pnpm i
pnpm dev
# .env KOA_PORT=7001
open http://localhost:7001/
```

### 2.2 宿主进程部署

```bash
pnpm start
```

### 2.3 测试与代码风格

```bash
pnpm test   # 单元测试
pnpm lint   # mwts 代码风格检查
pnpm lint:fix
```

## 3. Docker 部署(双模式)

镜像内不带任何 `.env*` 文件,容器配置全部由 compose 注入:`env_file`(`.env` 通用层 → `.env.prod` 部署层)+ `environment`(容器拓扑键)。宿主 pm2/裸进程形态不受影响。

注意 env_file 合并规则:`.env.prod` 中同名键**即使留空也会覆盖** `.env` 的非空值,不打算覆盖的键须整行删除。

**部署前置**:`.env.prod` 中 `MEDIA_TOKEN_URL` / `MEDIA_API_BASE` / `MEDIA_CLIENT_ID` / `MEDIA_CLIENT_SECRET` 四键必须填齐,缺失时容器启动即失败(应用侧 onReady 校验)。

### 3.1 默认模式 shared(复用宿主/外部 MySQL)

`docker-compose.yml`,仅 api 容器,`MYSQL_HOST` 由 compose 硬编码为 `host.docker.internal`(`.env.prod` 的 `127.0.0.1` 是宿主 pm2 视角值,保留不动);uploads/logs 与宿主目录 bind mount 同盘互见。

Linux 部署机额外前提:宿主 MySQL 须监听容器可达地址(端口映射 `0.0.0.0`,原生只绑 `127.0.0.1` 的不通),且须**预先创建 `.env.prod` 凭证对应的账户与库**(compose 不会代建,缺失时报 `Access denied for user 'blog'@'172.17.0.1'`):

```sql
CREATE DATABASE IF NOT EXISTS blog;
CREATE USER IF NOT EXISTS 'blog'@'%' IDENTIFIED BY '<.env.prod 的 MYSQL_PASSWORD>';
GRANT ALL PRIVILEGES ON blog.* TO 'blog'@'%';
FLUSH PRIVILEGES;
```

另有目录属主前提:`chown -R 1000:1000 logs upload-files`(容器以 node 用户运行)。

### 3.2 自包含模式 bundled(api + 专属 MySQL)

`docker-compose.bundled.yml`,内置 mysql:8.4(named volume,不映射宿主端口),一键全套、销毁重建干净。MySQL 拓扑键(host/端口/用户名)硬编码在编排文件中;密码默认 `blog@docker`,可在项目根 `.env` 写 `MYSQL_PASSWORD`/`MYSQL_ROOT_PASSWORD`/`MYSQL_DATABASE` 覆盖(注意:密码仅对全新数据卷生效,换密码需 `docker compose -f docker-compose.bundled.yml down -v` 清卷重建)。全新库由 `MYSQL_SYNC=true` 自举建表。

### 3.3 常用命令

```bash
pnpm docker:build          # 构建镜像(tag 取 package.json 版本)
pnpm docker:up             # 默认 shared 模式启动
pnpm docker:up:bundled     # bundled 模式启动
pnpm docker:down           # 停止并清两模式容器(含 --remove-orphans)
pnpm docker:down:bundled   # 停止 bundled 模式
pnpm docker:logs           # 跟随 api 日志
pnpm docker:clear          # down 并删除镜像
```

改了源码 `up` 不会自动重建镜像,先 `docker:build`;跨模式切换必须先 down(两文件服务集不同,down 已带 `--remove-orphans` 防孤儿容器残留)。统一走 `pnpm docker:*` 脚本调用:镜像 tag 取自 pnpm 注入的版本号,直接 `docker compose` 调用会回退 `latest`,与版本号 tag 并存形成双 tag 漂移(跑旧代码且无提示)。

### 3.4 双视角地址约定

- 同机服务(宿主 MySQL、同机 media-api/account-api)容器内一律 `host.docker.internal` 形态;`.env` 写本地直觉形态(`localhost`),容器视角差异由 compose `environment` 或 `.env.prod` 覆盖
- OAuth/Media 的**远程**端点地址(如 `https://api.account.isdream.cn`)容器内直接可达,无需覆盖;iss 校验类配置两视角必须同值,不参与覆盖
- 改端口只改 `.env` 的 `KOA_PORT` 一处,compose 映射与容器内监听同源替换

## License

[MIT](https://opensource.org/license/mit/)
Copyright (c) 2022-present isdream.cn
