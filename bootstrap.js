const { Bootstrap } = require('@midwayjs/bootstrap');

process.env.CURRENT_ENV = 'prod';

Bootstrap.run().then(() => {
  console.log(`启动成功: http://127.0.0.1:${process.env.KOA_PORT}`);
});
