const path = require('path');
const Koa = require('koa');
const logger = require('koa-logger')
const views = require('koa-views');
const uuidv4 = require('uuid/v4');

const app = new Koa();

const onlineUsers = new Set()
app.use(logger())
// Must be used before any router is used
app.use(require('koa-static')('.'));
app.use(views(__dirname + '/views', {
  map: {
    html: 'atpl'
  }
}));

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
app.use(async function (ctx, next) {
  if (!ctx.origin) {
    await next()
  }
});

app.use(async function (ctx, next) {
  let userId = ctx.cookies.get('userId')
  const view = path.basename(ctx.originalUrl)
  await ctx.render(view, {
    userId,
    onlineUsers: Array.from(onlineUsers)
  });
});

app.listen(3000);