import { Provide, Inject } from '@midwayjs/decorator';
import { ILogger } from '@midwayjs/logger';
import { MidwayHttpError } from '@midwayjs/core';
import { createTokenFetcher, TokenFetcher } from 'isdream-oauth/server';

// @types/node@14 无 fetch/FormData/Blob/AbortSignal.timeout 类型；Node 18+ 运行时原生可用
const { FormData, Blob, fetch } = globalThis as any;
const abortSignalTimeout: (ms: number) => AbortSignal = (
  AbortSignal as any
).timeout.bind(AbortSignal);

/** media-api 上传响应（契约见 isdream-media-api PRD 十四） */
export interface MediaUploadResult {
  key: string;
  url: string;
  webpUrl: string;
  thumbUrl: string;
  width: number | null;
  height: number | null;
  size: number;
  mime: string;
}

@Provide()
export class MediaService {
  @Inject()
  logger: ILogger;

  // 领牌客户端惰性单例（令牌缓存与并发 single-flight 由 createTokenFetcher 内置）
  private fetcher: TokenFetcher | null = null;

  private get tokenFetcher(): TokenFetcher {
    if (!this.fetcher) {
      this.fetcher = createTokenFetcher({
        tokenEndpoint: process.env.MEDIA_TOKEN_URL,
        clientId: process.env.MEDIA_CLIENT_ID,
        clientSecret: process.env.MEDIA_CLIENT_SECRET,
        resource: 'https://media-api',
        scope: 'media:write',
      });
    }
    return this.fetcher;
  }

  /**
   * 转存文件到 media-api（POST /api/upload，serviceAuth 机器令牌）。
   * ownerId 为 blog 本地用户标识，X-Owner-Id 按 PRD 口径 = {client_id}:{本地用户id}，
   * client_id 与领牌凭证同源（MEDIA_CLIENT_ID），media 侧按前缀区分消费方。
   */
  async upload(
    data: Buffer,
    filename: string,
    mimeType: string,
    ownerId?: string | number
  ): Promise<MediaUploadResult> {
    const token = await this.tokenFetcher.getToken();

    const form = new FormData();
    form.append('file', new Blob([data], { type: mimeType }), filename);

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };
    if (ownerId !== undefined && ownerId !== null) {
      headers['X-Owner-Id'] = `${process.env.MEDIA_CLIENT_ID}:${ownerId}`;
    }

    const response = await fetch(`${process.env.MEDIA_API_BASE}/api/upload`, {
      method: 'POST',
      headers,
      body: form,
      // media-api 挂起不应拖住博客请求（≤25MB 上传 30s 足够）
      signal: abortSignalTimeout(30_000),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      const message =
        (body && body.message) ||
        `media-api 上传失败（HTTP ${response.status}）`;
      this.logger.warn(`media-api 上传失败：${response.status} ${message}`);
      throw new MidwayHttpError(message, response.status);
    }

    return (await response.json()) as MediaUploadResult;
  }
}
