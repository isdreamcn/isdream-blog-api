# Docker 双模式部署测试报告

- 测试日期：2026-10-06
- 测试环境：Windows 10 (26200) + Docker Desktop 29.8.0（linux/amd64 容器）、Docker Compose v5.5.1
- 被测对象：`docker-compose.yml`（shared 模式）、`docker-compose.bundled.yml`（bundled 模式）、`Dockerfile`
- 镜像：`isdream-blog-api:1.0.0`（`pnpm docker:build` 全缓存命中）
- 宿主 MySQL：监听 `0.0.0.0:3306`（满足 shared 模式网络前提）

## 结论

两种模式的**编排与镜像本身均能正常工作**（注入合法配置后全链路通过），但**按仓库现状原样 `up`，两种模式都无法启动**，原因是环境配置层的问题（见 P0）。测试全程未修改任何用户文件（`.env*` 未动，MySQL 未动，测试用 override 已删除）。

> **2026-10-06 修复更新**：P0-1 / P0-2 / P1-1 / P1-2 已按用户确认的方案修复并复测，详见各问题的「修复状态」。修复后原样 `up` 仍会报缺 `MEDIA_API_BASE` 一键（生产值需部署时填入），属预期行为。

---

## 问题清单

### P0-1 按仓库现状原样启动，两种模式均失败：MEDIA 转存配置缺失

**现象**（bundled 模式实测日志，shared 同因）：

```
Error: media-api 转存配置缺失: MEDIA_API_BASE, MEDIA_CLIENT_SECRET，请参照 .env.example 补齐
```

api 容器陷入无限重启（`restart: unless-stopped`，backoff 逐步拉长至稳定间隔后仍持续重试）。

**根因有两个，叠加发生**：

1. `.env.prod` 中 `MEDIA_API_BASE`、`MEDIA_CLIENT_SECRET` 均为空（README 3 节已声明此为部署前置，但当前文件未填齐）。
2. **隐蔽坑**：compose `env_file` 是「后文件整体覆盖前文件」的合并规则，**空字符串同样会覆盖**。`.env` 中 `MEDIA_CLIENT_SECRET` 有非空值，但 `.env.prod` 同名键为空 → 容器最终拿到空值。也就是说：即使在 `.env` 里填了 secret，只要 `.env.prod` 留了空键名，值就会被静默清空。实测错误信息同时列出 `MEDIA_CLIENT_SECRET`，证明覆盖确实发生（否则只会报 `MEDIA_API_BASE` 一个键）。

**建议**：`.env.prod` 中不打算覆盖的键应当**整行删除**（删键才不参与覆盖），只保留部署层真正要改的键；四个 MEDIA 键要么填齐生产值，要么不出现。

**修复状态**：✅ 已修复（用户确认方案：删除全部空键）。已从 `.env.prod` 删除 `MEDIA_CLIENT_SECRET` / `MEDIA_API_BASE` 两个空键并加注释说明覆盖规则，README 3 节补充空值覆盖提醒。复测：报错键名从 `MEDIA_API_BASE, MEDIA_CLIENT_SECRET` 变为仅 `MEDIA_API_BASE`，空值覆盖坑消除，`MEDIA_CLIENT_SECRET` 成功从 `.env` 透传。剩余的 `MEDIA_API_BASE` 需部署时填入生产值（当前两份 env 均无值，启动期会明确报出，符合设计意图）。

### P0-2 shared 模式额外前置未满足：宿主 MySQL 无 `.env.prod` 凭证对应账户

**现象**（shared 模式实测日志）：

```
Error: Access denied for user 'blog'@'172.17.0.1' (using password: YES)
```

**分析**：这证明 `host.docker.internal` 网络链路是通的（收到的是 MySQL 认证拒绝，而非连接拒绝），失败点在宿主 MySQL 没有预先创建 `.env.prod` 所写的 `blog` 账户/密码。README 3.1 只写了「宿主 MySQL 须监听容器可达地址」这一个前提，**未提「账户与库需预先在宿主 MySQL 创建」**。

**建议**：README 3.1 补充该前置说明（含授权 SQL 示例）。

**修复状态**：✅ 已修复。README 3.1 已补充「预先创建 `.env.prod` 凭证对应的账户与库」前置说明，含 `CREATE DATABASE` / `CREATE USER` / `GRANT` SQL 示例与失败报错样例。

**注意时序**：DB 连接失败发生在 MEDIA 校验**之前**（typeorm 组件初始化先于 `onReady`），排查时先解决 DB 认证，才会看到 MEDIA 校验报错。

### P1-1 双镜像 tag 存在版本漂移风险

`image: isdream-blog-api:${npm_package_version:-latest}`：经 `pnpm run` 调用注入 `1.0.0`，直接 `docker compose` 调用回退 `latest`。实测本机已同时存在 `1.0.0` 与 `latest` 两个 tag（后者是更早的一次构建）。风险场景：改代码后 `pnpm docker:build` 只更新 `1.0.0`，此时任何人直接 `docker compose up -d` 会用**旧的 latest** 跑旧代码且无任何提示（镜像已存在不会触发自动重建）。

**建议**：文档强调统一走 `pnpm docker:*` 脚本；或干脆删除本机遗留的 `latest` tag 消除歧义。

**修复状态**：✅ 已修复（用户确认删除）。README 3.3 已加「统一走 `pnpm docker:*` 脚本，直接 `docker compose` 调用会回退 `latest` 形成双 tag 漂移」警告；本机遗留 `latest` tag 已删除，现仅存 `1.0.0`（下次直接 `docker compose` 调用会因 `latest` 不存在触发重新构建，而非跑旧代码）。

### P1-2 `.env.prod` 内容与用途自相矛盾

文件头注释是 `# .env.dev`，`NODE_ENV=development`，与「生产部署层」的定位矛盾。compose 部署下被 `environment.NODE_ENV=production` 强制覆盖，**无实际影响**；但该文件若服务于宿主 pm2 形态，进程会以 development 启动。建议修正文件头与 NODE_ENV。

**修复状态**：✅ 已修复（用户确认改为 production）。文件头注释改为 `# .env.prod`，`NODE_ENV=production`。

### P1-3 配置类错误下的无限重启循环（中性观察）

MEDIA 缺失 / DB 凭证错误这类**不会自愈的配置错误**，在 `restart: unless-stopped` 下会无限重试、日志持续刷屏。优点是中途修好 `.env` 后无需任何操作即可自愈启动。维持现状可接受，仅作记录。

### P1-4 跨模式切换的孤儿容器警告：实测属实

bundled 运行中直接 `docker compose -f docker-compose.yml up -d`（不先 down）：api 容器被 Recreated 为 shared 配置，`isdream-blog-api-mysql-1` 成为**孤儿容器继续运行**（占用资源、残留数据卷，且是数据混淆源）。README「跨模式切换必须先 down」的警告与实测行为一致，务必遵守。

---

## 验证通过项

注入最小合法配置后（临时 override，已删除），以下链路全部实测通过：

| 验证项 | 结果 |
| --- | --- |
| 镜像构建（多阶段、pnpm prune、sharp 与 alpine libc 一致） | ✅ |
| `.dockerignore` 生效：镜像内无 `.env*` / `ecosystem.config.js` 残留 | ✅（实测 `ls /app`） |
| env_file 链 + environment 覆盖：`KOA_GLOBAL_PREFIX=/blog` 生效 | ✅（无前缀 404 / 带前缀 401） |
| healthcheck（镜像层与 compose 双定义，命令一致） | ✅ 两种模式均 healthy |
| shared：`host.docker.internal` 解析与连通（Docker Desktop） | ✅ |
| shared：bind mount 双向可写（宿主 ↔ 容器内 node 用户） | ✅ |
| bundled：mysql:8.4 健康检查、`depends_on: service_healthy` 时序 | ✅ |
| bundled：`MYSQL_SYNC=true` 自举建表 | ✅（14 张表） |
| bundled：named volume 写入（uploads/logs/mysql） | ✅ |
| bundled：mysql 不映射宿主端口（安全默认） | ✅（仅容器内暴露） |
| 端口同源替换：`KOA_PORT=8002` 单点改，映射/容器监听/healthcheck 三处一致 | ✅ |
| `down -v` 清卷干净（3 个 named volume 全删） | ✅ |
| `down --remove-orphans` 清理跨模式孤儿 | ✅ |
| 容器以 `node`(uid 1000) 非 root 运行；`TZ=Asia/Shanghai` 日志时间正确 | ✅ |

业务接口探活：`GET /blog/article/select → 401`（JWT 保护生效，路由与中间件链路正常）。

> Windows 环境说明：shared 模式 bind mount 的 `chown -R 1000:1000` 前提仅 Linux 需要（README 已记录），Windows Docker Desktop 下无此约束，实测容器内 node 用户可写。

## 复现命令

```bash
# 原样复现 P0-1（bundled）：api 无限重启报 MEDIA 配置缺失
# 修复后预期：仅报 MEDIA_API_BASE 一键（生产值待部署时填入）
pnpm docker:up:bundled && docker compose -f docker-compose.bundled.yml logs api

# 原样复现 P0-2（shared）：报 Access denied for user 'blog'
# （本机无 blog 账户属环境差异，README 已补预建前置；部署机按 SQL 预建后不复现）
pnpm docker:up && pnpm docker:logs

# 复现 P1-4 孤儿容器：bundled 运行中直接切 shared
docker compose -f docker-compose.yml up -d && docker ps   # mysql-1 仍在运行即孤儿
```

## 测试后环境状态

两模式均已 `down`（bundled 已 `down -v` 清卷），无残留容器/卷/网络；测试用 override 文件已删除；镜像仅存 `1.0.0`（遗留 `latest` 已按用户确认删除）。
