const { CQCode } = require('koishi-utils')
const netease = require('./platforms/netease')
const qq = require('./platforms/qq')

const platforms = {
  netease,
  qq,
}

const defaultOptions = {
  showWarning: false,
  platform: 'qq',
}

module.exports.name = 'music'

module.exports.apply = (ctx, options = {}) => {
  const { showWarning, platform } = { ...defaultOptions, ...options }

  ctx.command('music <name...>', '点歌')
    .option('-p, --platform <platform>', `点歌平台，目前支持 qq, netease，默认为 ${platform}`)
    .alias('点歌')
    .shortcut('来一首', { fuzzy: true, oneArg: true })
    .shortcut('点一首', { fuzzy: true, oneArg: true })
    .shortcut('整一首', { fuzzy: true, oneArg: true })
    .action(async ({ options, meta }, keyword) => {
      if (!options.platform) options.platform = platform
      const search = platforms[options.platform]
      if (!search) {
        return meta.$send(`目前不支持平台 ${options.platform}。`)
      }

      try {
        const result = await search.call(ctx, keyword)
        if (typeof result === 'object') {
          return meta.$send(CQCode.stringify('music', result))
        }
      } catch {}

      if (showWarning) {
        return meta.$send('点歌失败，请尝试更换平台。')
      }
    })
}
