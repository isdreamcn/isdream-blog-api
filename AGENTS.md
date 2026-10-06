# isdream-blog-api

isdream.cn 博客后端:Midway 3(Node ≥20,TS 4.8)+ Koa + TypeORM(MySQL)。含 OAuth 登录(isdream-oauth 对接 account-api)、文件上传转存 media-api(sharp 压缩为 w100/w750/w2560.webp 三档)、SEO 推送(bing/baidu)。包管理器 pnpm(10.x),勿用 npm/yarn。

## 常用命令

```bash
pnpm dev        # 本地开发,CURRENT_ENV=local,端口取 .env KOA_PORT(默认 7001)
pnpm build      # 构建(CURRENT_ENV=prod),产物 dist/
pnpm start      # build 后 node bootstrap.js 宿主进程启动
pnpm test       # jest 单测(midway-bin test --ts)
pnpm cov        # 覆盖率
pnpm lint       # mwts 检查;lint:fix 自动修复
```

Docker 双模式部署详见 README.md §3,要点:统一走 `pnpm docker:*` 脚本(镜像 tag 取 package.json 版本,直接 `docker compose` 调用会回退 latest 造成双 tag 漂移);改源码后需先 `docker:build`;跨 shared/bundled 模式切换必须先 down。

## 目录与分层

- `src/controller` → `src/service` → `src/entity`(TypeORM);`src/dto` 为入参校验 DTO(@midwayjs/validate,路由上配 `@Validate()`)
- `src/config` — Midway 配置;环境变量全部经 `src/configuration.ts` 顶部 dotenv 加载(`.env` 先载,`.env.{CURRENT_ENV}` 后载覆盖)
- `src/guard/auth.guard.ts` + `src/decorator/role.decorator.ts` — 全局鉴权
- `src/middleware` — report / jwt / format 三件套;`src/filter` — 全局错误过滤器
- `src/service/media.service.ts` — media-api 转存链路;`src/service/seo.service.ts` — 收录推送
- `test/controller` — jest 集成测试;`typings/environment.d.ts` — 环境变量类型

## 关键约定与坑

- **鉴权默认收紧**:未标 `@Role()` 的路由在 AuthGuard 中默认按 `['admin']` 处理(需管理员 JWT)。角色语义:`'pc'` = 公开(不校验)、`'login'` = 登录用户、`'admin'` = 管理员。新增公开接口必须显式标 `@Role(['pc'])`。
- **响应格式**:全局 `FormatMiddleware` 统一包裹 `{code: 200, message: 'OK', ...result}`,controller 直接返回业务对象即可,不要手动包 code/message。例外:GET `/file/` 路径与不带 `KOA_GLOBAL_PREFIX` 前缀的路径不包裹。
- **环境变量**:模板见 `.env.example`,真实 `.env*` 不入库。`MEDIA_TOKEN_URL / MEDIA_API_BASE / MEDIA_CLIENT_ID / MEDIA_CLIENT_SECRET` 四键必填,缺失时 onReady 启动期直接抛错(故意设计,勿改为懒校验)。
- **Docker env 合并**:compose 的 `env_file`(.env → .env.prod)同名键即使留空也会覆盖前层非空值,不打算覆盖的键须整行删除。
- **双视角地址**:同机服务在容器内用 `host.docker.internal`,`.env` 写本地直觉形态(`localhost`),差异由 compose `environment` 或 `.env.prod` 覆盖;远程端点与 iss 校验类配置两视角同值,不参与覆盖。
- 装饰器从 `@midwayjs/decorator` 导入(非 `@midwayjs/core`),沿用现有文件风格。
- 注释与文档统一中文;lint 用 mwts(Google 风格),`endOfLine: auto`。

## 提交规范

commitlint + husky 强制 conventional commits,交互式提交用 `pnpm commit`(commitizen)。不要自行 git commit,需用户确认。

## 变更敏感区前先读

- 改部署/compose/Dockerfile:先读 `README.md` §3 与 `docker-deploy-test-report.md`
- 改 OAuth/登录:先读 `.env.example` 中 OAUTH_* 注释与 `src/service/user.service.ts`
- 改上传链路:先读 `src/service/file.service.ts` 与 `src/service/media.service.ts`
