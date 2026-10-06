# ========================================
# 阶段 1：构建
# ========================================
# 运行阶段同为 alpine（musl）：sharp 的平台二进制随 pnpm install 按当前
# libc 落盘，两阶段基础镜像不一致会导致运行期加载失败
FROM node:22-alpine AS build

WORKDIR /app

# corepack 由 package.json 的 packageManager 字段决定 pnpm 版本
RUN corepack enable

# 先复制依赖清单，利用 Docker 分层缓存：依赖不变时跳过安装步骤
# pnpm-workspace.yaml 的 onlyBuiltDependencies 决定 sharp 允许执行安装脚本
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile

# 依赖安装完成后再复制源码，源码变更不会使依赖缓存失效
COPY . .
RUN pnpm run build

# 移除 prepare 脚本（husky 在 prune 后不可用），裁剪为纯生产依赖
RUN npm pkg delete scripts.prepare && pnpm prune --prod

# ========================================
# 阶段 2：运行
# ========================================
FROM node:22-alpine

WORKDIR /app

# 安装时区数据
RUN apk add --no-cache tzdata

ENV TZ="Asia/Shanghai"
ENV NODE_ENV=production

# 复制构建产物（--chown=node:node 确保文件归属正确，配合 USER node 使用）
COPY --from=build --chown=node:node /app/dist ./dist
# 保留 src/ 以便生产环境错误堆栈显示正确的源码行号（Midway 官方推荐）
COPY --from=build --chown=node:node /app/src ./src
COPY --from=build --chown=node:node /app/bootstrap.js ./
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/package.json ./

# 创建运行时写入目录并赋权给 node 用户（named volume 首挂按镜像层属主初始化）
RUN mkdir -p /app/logs/isdream-blog-api /app/upload-files && chown -R node:node /app/logs /app/upload-files

# 安全最佳实践：以非 root 用户运行容器进程
USER node

EXPOSE 7001

# 健康检查：请求根路径（globalPrefix 有无均可），状态码 < 500 视为健康
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:'+(process.env.KOA_PORT||7001)+'/',r=>process.exit(r.statusCode<500?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "bootstrap.js"]
