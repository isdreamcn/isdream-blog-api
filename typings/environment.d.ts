export {}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production'
      KOA_PORT: string
      KOA_GLOBAL_PREFIX: string
      MYSQL_HOST: string
      MYSQL_PORT: string
      MYSQL_USERNAME: string
      MYSQL_PASSWORD: string
      MYSQL_DATABASE: string
      MYSQL_SYNC: string
      ADMIN: string
      ADMIN_PASSWORD: string

      // SEO 资源收录
      // bing
      SEO_BING_HOST?: string
      SEO_BING_KEY?: string
      SEO_BING_KEY_LOCATION?: string

      // baidu
      SEO_BAIDU_SITE?: string
      SEO_BAIDU_TOKEN?: string
    }
  }
}
