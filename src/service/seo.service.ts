import { HttpService } from '@midwayjs/axios';
import { Provide, Inject } from '@midwayjs/decorator';
import { ILogger } from '@midwayjs/logger';

// 资源收录
@Provide()
export class SEOService {
  @Inject()
  httpService: HttpService;

  @Inject()
  logger: ILogger;

  async bing(urlList: string[] = []) {
    const { SEO_BING_HOST, SEO_BING_KEY, SEO_BING_KEY_LOCATION } = process.env;
    if (
      !SEO_BING_HOST ||
      !SEO_BING_KEY ||
      !SEO_BING_KEY_LOCATION ||
      !urlList.length
    ) {
      return;
    }

    urlList = urlList.map(url => SEO_BING_HOST + url);

    this.httpService
      .request({
        url: 'https://www.bing.com/indexnow',
        method: 'POST',
        params: {
          url: SEO_BING_KEY_LOCATION,
          key: SEO_BING_KEY,
        },
        data: {
          host: SEO_BING_HOST,
          key: SEO_BING_KEY,
          keyLocation: SEO_BING_KEY_LOCATION,
          urlList,
        },
      })
      .then(res => {
        this.logger.info(
          `SEO Bing(${res.status}): ${res.data?.message || '请求成功'}`
        );
      })
      .catch(err => {
        this.logger.warn(
          `SEO Bing(${err?.response?.status}): ${
            err?.response?.data?.message ||
            err?.response?.data?.code ||
            '请求失败'
          }`
        );
      });
  }

  async baidu(urlList: string[] = []) {
    const { SEO_BAIDU_SITE, SEO_BAIDU_TOKEN } = process.env;
    if (!SEO_BAIDU_SITE || !SEO_BAIDU_TOKEN || !urlList.length) {
      return;
    }

    urlList = urlList.map(url => `https://${SEO_BAIDU_SITE}` + url);

    this.httpService
      .request({
        url: 'http://data.zz.baidu.com/urls',
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        params: {
          site: SEO_BAIDU_SITE,
          token: SEO_BAIDU_TOKEN,
        },
        data: urlList.join('/n'),
      })
      .then(res => {
        this.logger.info(
          `SEO Baidu(${res.status}): 请求成功 remain:${res.data.remain};success:${res.data.success};`
        );
      })
      .catch(err => {
        this.logger.warn(
          `SEO Baidu(${err?.response?.status}): ${
            err?.response?.data?.message ||
            err?.response?.data?.code ||
            '请求失败'
          }`
        );
      });
  }
}
