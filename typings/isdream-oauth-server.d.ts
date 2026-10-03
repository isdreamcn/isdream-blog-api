/**
 * isdream-oauth/server 子路径 ambient 声明。
 * 包内 exports 字段分发 ./server（require → dist/isdream-oauth-server.cjs.js），
 * 本项目 TS4.8 + moduleResolution:node 不解析 exports：运行时 require 无碍，类型由此补齐。
 * 签名与 npm-oauth/publish/dist/isdream-oauth-server.d.ts（0.3.0）一致，仅保留本项目用到的部分。
 */
declare module 'isdream-oauth/server' {
  export interface TokenFetcherOptions {
    /** token 端点完整 URL（如 https://<account-api>/oidc/token） */
    tokenEndpoint: string;
    clientId: string;
    clientSecret: string;
    /** RFC 8707 resource 参数，领牌必传，决定令牌 aud */
    resource: string;
    scope?: string;
  }
  export interface TokenFetcher {
    /** 内置缓存至临期、并发 single-flight；失败抛 TokenFetchError，不重试 */
    getToken(): Promise<string>;
  }
  export class TokenFetchError extends Error {
    status?: number;
    code?: string;
    description?: string;
  }
  export function createTokenFetcher(options: TokenFetcherOptions): TokenFetcher;
}
