const http = require('http');
const https = require('https');
const path = require('path');
const fs = require('fs');

const Koa = require('koa');
const logger = require('koa-logger')
const views = require('koa-views');
const uuidv4 = require('uuid/v4');
const Router = require('koa-router');
const enforceHttps = require('koa-sslify');
const session = require('koa-session-redis');

const routes = require('./routes');
const store = require('./store');

const router = new Router()

const app = new Koa();

routes(router)
app.keys = ['room.limibee.com'];

app.use(session({
  maxAge: 1000 * 60 * 60 * 8,
  store: {
    host: 'v7.limibee.com',
    port: 6379,
    options: {
      password: 'limibee.com'
    }
  },
}));

app.use(enforceHttps());

app.use(logger())
// Must be used before any router is used
app.use(require('koa-static')('./assets'));

app.use(async function (ctx, next) {
  if (!ctx.session.uid) {
    ctx.session.uid = uuidv4()
  }
  await next()
});

app.use(router.routes())
app.use(views(__dirname + '/views', {
  map: {
    html: 'atpl'
  }
}));

app.use(async function (ctx, next) {
  let userId = ctx.session.uid
  const view = path.basename(ctx.originalUrl)
  await ctx.render('study', {
    userId,
    onlineUsers: Array.from(onlineUsers)
  });
});

http.createServer(app.callback()).listen(3000);
https.createServer({
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.crt')
}, app.callback()).listen(3001);