const http = require('http');
const https = require('https');
const path = require('path');
const fs = require('fs');

const Koa = require('koa');
const socketio = require('socket.io');
const logger = require('koa-logger')
const views = require('koa-views');
const uuidv4 = require('uuid/v4');
const Router = require('koa-router');
const enforceHttps = require('koa-sslify');
const session = require('koa-session-redis');
const convert = require('koa-convert')

const routes = require('./routes');
const store = require('./store');
const router = new Router()

const app = new Koa();

routes(router)

// http.createServer(app.callback()).listen(process.env.port);
const server = https.createServer({
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.crt')
}, app.callback())

const io = socketio(server, {
  pingInterval: 5000
})

server.listen(process.env.PORT || 3000);

io.on('connection', function (socket) {
  console.log('a user connected');
});

app.keys = ['room.limibee.com'];

app.use(session({
  maxAge: 1000 * 60 * 60 * 8,
  store
}));
app.store = store
app.use(enforceHttps());

app.use(logger())
app.use(async function (ctx, next) {
  // TODO: uid不应该每次都随机
  if (!ctx.session.uid) {
    ctx.session.uid = uuidv4()
  }
  await next()
});
if (process.env.NODE_ENV == 'development') {
  app.use(
    convert(
      require('koa-webpack-dev-middleware')(
        require('webpack')(
          require('./webpack.config.js')
        ), {
          stats: {
            colors: true
          },
          publicPath: "/"
        })
    )
  )
} else {
  app.use(require('koa-static')('.'));
}

app.use(views(__dirname + '/views', {
  map: {
    html: 'atpl'
  }
}));
app.use(router.routes())