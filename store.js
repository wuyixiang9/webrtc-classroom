const redisStore = require('koa-redis')({
  host: '127.0.0.1',
  port: 6379,
  options: {
    // password: 'limibee.com'
  }
});
module.exports = redisStore