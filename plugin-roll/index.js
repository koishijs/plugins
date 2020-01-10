const { getSenderName } = require('koishi-core')
const { isInteger } = require('koishi-utils')

module.exports.name = 'roll'

module.exports.apply = (ctx) => {
  ctx.command('roll [times] [max]', '掷骰子')
    .action(({ meta }, _times, _max) => {
      const max = Number(_max || 6)
      const times = Number(_times || 1)
      if (!isInteger(max) || !isInteger(times) || max <= 1 || max >= (1 << 16) || times <= 0 || times > 64) {
        return meta.$send('请输入正确的参数。')
      }

      const values = []
      for (let index = 0; index < times; index += 1) {
        values.push(Math.floor(Math.random() * max) + 1)
      }

      return meta.$send(`${getSenderName(meta)} 获得的点数为 ${values.join('+')}${times > 1 ? `=${values.reduce((prev, curr) => prev + curr, 0)}` : ''}`)
    })

  ctx.middleware((meta, next) => {
    const capture = /^\.r(\d{1,2})d(\d{1,5})/i.exec(meta.message.trim())
    if (!capture) return next()
    return ctx.runCommand('roll', meta, [capture[1], capture[2]])
  })
}
