export {}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production'
      MYSQL_HOST: string
      MYSQL_PORT: number
      MYSQL_USERNAME: string
      MYSQL_PASSWORD: string
      MYSQL_DATABASE: string
      ROOT: string
      ROOT_PASSWORD: string
    }
  }
}
