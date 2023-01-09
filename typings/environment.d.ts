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
    }
  }
}
