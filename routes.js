const koaBody = require('koa-body');

module.exports = function (router) {
  router
    .get('/sdp', function (ctx, next) {
      const user = ctx.store.get(ctx.query.remoteId)
      ctx.body = { sdp: user.sdp }
    })
    .post('/sdp/:type', koaBody(), function (ctx, next) {
      const userId = ctx.cookies.get('userId')
      const type = ctx.params.type
      ctx.store.set(userId, {
        type,
        sdp: ctx.request.body.sdp
      })
      ctx.body = { status: 'success' }
    })
    .get('/view/:file', async function (ctx, next) {
      let userId = ctx.session.uid
      await ctx.render(ctx.params.file, {
        userId
      });
    })
}