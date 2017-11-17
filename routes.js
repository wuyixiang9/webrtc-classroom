const koaBody = require('koa-body');

module.exports = function (router) {
  router
    .get('/sdp', function (ctx, next) {
      const { uid, type } = ctx.request.body
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
      let userId = ctx.session.uid
      await ctx.render(ctx.params.file, {
        userId
      });
    })
}