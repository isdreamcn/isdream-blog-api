const packageData = require('./package.json');

module.exports = {
  apps: [
    {
      // 应用程序名称
      name: packageData.name,
      // 执行文件
      script: './bootstrap.js',
      // 是否启用监控模式，默认是false。如果设置成true，当应用程序变动时，pm2会自动重载。这里也可以设置你要监控的文件。
      watch: ['dist', 'bootstrap.js'],
      // 应用程序启动模式，这里设置的是 cluster_mode（集群），默认是fork
      exec_mode: 'cluster_mode',
      // 应用启动实例个数，仅在cluster模式有效 默认为fork；或者 max
      instances: 3,
      // 自定义应用程序的错误日志文件(错误日志文件)
      error_file: './logs/app-err.log',
      // 自定义应用程序日志文件(正常日志文件)
      out_file: './logs/app-out.log',
      // 设置追加日志而不是新建日志
      merge_logs: true,
      // 指定日志文件的时间格式
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      // 最小运行时间，这里设置的是60s即如果应用程序在* 60s内退出，pm2会认为程序异常退出，此时触发重启* max_restarts设置数量，应用运行少于时间被认为是异常启动
      min_uptime: '60s',
      // 设置应用程序异常退出重启的次数，默认15次（从0开始计数）,最大异常重启次数，即小于min_uptime运行时间重启次数；
      max_restarts: 10,
      // 启用/禁用应用程序崩溃或退出时自动重启，默认为true, 发生异常的情况下自动重启
      autorestart: true,
      // 异常重启情况下，延时重启时间
      restart_delay: 5 * 1000,
    },
  ],
};
