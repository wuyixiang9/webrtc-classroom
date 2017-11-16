
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
const routes = require('./routes');
const store = require('./store');

const router = new Router()

const app = new Koa();
const onlineUsers = new Set()

routes(router)

app.use(enforceHttps());
app.use(async function (ctx, next) {
  ctx.store = store
  await next()
});
app.use(logger())
// Must be used before any router is used
app.use(require('koa-static')('./assets'));

app.use(async function (ctx, next) {
  let userId = ctx.cookies.get('userId')
  if (!userId) {
    userId = uuidv4()
    ctx.cookies.set('userId', userId)
  }
  if (!onlineUsers.has(userId)) {
    onlineUsers.add(userId)
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
  let userId = ctx.cookies.get('userId')
  const view = path.basename(ctx.originalUrl)
  await ctx.render(view, {
    userId,
    onlineUsers: Array.from(onlineUsers)
  });
});

http.createServer(app.callback()).listen(3000);
https.createServer({
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.crt')
}, app.callback()).listen(3001);