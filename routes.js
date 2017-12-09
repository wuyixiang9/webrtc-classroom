const koaBody = require('koa-body');

module.exports = function (router) {
  router
    .get('/sdp', koaBody(), async function (ctx, next) {
      const { uid, type } = ctx.request.query
      if (uid) {
        if (type) {
          const sdp = await ctx.app.store.get(`sdp-${uid}-${type}`)
          ctx.body = {
            [type]: sdp
          }
        } else {
          const offer = await ctx.app.store.get(`sdp-${uid}-offer`)
          const answer = await ctx.app.store.get(`sdp-${uid}-answer`)
          ctx.body = {
            offer,
            answer
          }
        }
      }
    })
    .post('/sdp', koaBody(), async function (ctx, next) {
      const { type, sdp } = ctx.request.body
      const { uid } = ctx.session
      try {
        await ctx.app.store.set(`sdp-${uid}-${type}`, sdp)
        ctx.body = {
          code: 200
        }
      } catch (e) {
        ctx.body = {
          code: 0,
          msg: e.message
        }
      }
    })
    .get('/view/:file', async function (ctx, next) {
      const userId = ctx.session.uid
      await ctx.render(ctx.params.file, {
        userId
      });
    })
    // TODO 每次取的不一样
    .get('/uid', async function (ctx) {
      const uid = ctx.session.uid
      ctx.body = {
        uid
      }
    })
}