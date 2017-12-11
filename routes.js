const debug = require('debug')('sdp')
const koaBody = require('koa-body');

module.exports = function (router) {
  router
    .get('/sdp', koaBody(), async function (ctx, next) {
      const { uid, type } = ctx.request.query
      if (uid && type) {
        debug(`get ${uid} sdp ,type ${type}`)
        const sdp = await ctx.app.store.get(`sdp-${uid}-${type}`)
        ctx.body = {
          type,
          sdp
        }
      }
    })
    .post('/sdp', koaBody(), async function (ctx, next) {
      const { type, sdp } = ctx.request.body
      const { uid } = ctx.session
      if (type && sdp) {
        try {
          debug(`save ${uid} sdp ,type ${type}`)
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
      }
    })
    .get('/candidate', koaBody(), async function (ctx, next) {
      const { uid } = ctx.request.query
      const key = `candidate-${uid}`
      if (uid) {
        const length = await ctx.app.store.client.llen(key)
        const candidates = await ctx.app.store.client.lrange(key, 0, length)
        ctx.body = {
          candidates: candidates.map(c => JSON.parse(c))
        }
      }
    })
    .post('/candidate', koaBody(), async function (ctx, next) {
      const { candidate } = ctx.request.body
      const { uid } = ctx.session
      const key = `candidate-${uid}`
      if (uid && candidate) {
        await ctx.app.store.client.lpush(key, JSON.stringify(candidate))
        ctx.body = {
          code: 200
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