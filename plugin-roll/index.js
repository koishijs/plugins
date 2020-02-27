const { isInteger, randomInt } = require('koishi-utils')

module.exports.name = 'roll'

/**
 * @param { import('koishi-core').Context } ctx context
 */
module.exports.apply = (ctx, options = {}) => {
  options = {
    maxPoint: 1 << 16,
    maxTimes: 64,
    state: {},
    getSenderName: meta => meta.sender.card || meta.sender.nickname || meta.userId,
    ...options,
  }

  function displayTotal (values) {
    let message = values.join('+')
    if (values.length > 1) {
      message += '=' + values.reduce((prev, curr) => prev + curr, 0)
    }
    return message
  }

  ctx.middleware((meta, next) => {
    if (!meta.$parsed.prefix) return next()

    /** @type { RegExpExecArray } */
    let cap

    if (cap = /^st\s*(.+?)\s*(\d+)$/i.exec(meta.$parsed.message)) {
      const [_, prop, _value] = cap
      const value = +_value
      if (!isInteger(value) || value <= 0 || value > options.maxPoint) {
        return meta.$send(`点数必须在 1 到 100 之间。`)
      }
      options.state[prop] = value
      return meta.$send(`已设置“${prop}”的属性值为 ${value}。`)
    }

    if (cap = /^ra\s*(.*?)\s*(\d*)$/i.exec(meta.$parsed.message)) {
      const [_, prop, arg] = cap
      let target
      if (arg) {
        target = +arg
        if (target < 1 || target > 100) {
          return meta.$send('属性值必须在 1 到 100 之间。')
        }
      } else if (prop) {
        target = options.state[prop]
        if (!target) {
          return meta.$send(`未设置“${prop}”的属性值。`)
        }
      }
      const value = randomInt(100) + 1
      return meta.$send(`${options.getSenderName(meta)} 进行${prop}检定：D100=${value}/${target} ${value < target ? '成功' : '失败'}`)
    }

    const message = meta.$parsed.message.replace(/\s/g, '')

    if (cap = /^rb(\d*)$/i.exec(message)) {
      const [_, arg] = cap
      const times = +arg || 1
      const values = [], bonuses = []
      for (let index = 0; index < times; index += 1) {
        const value = randomInt(100) + 1
        const tens = Math.floor(value / 10)
        const bonus = randomInt(10)
        bonuses.push(bonus)
        values.push(Math.min(tens, bonus) * 10 + value % 10)
      }
      return meta.$send(`${options.getSenderName(meta)} 掷骰：${message.slice(1)}=${displayTotal(values)} (奖励骰：${bonuses.join(', ')})`)
    }

    if (cap = /^rp(\d*)$/i.exec(message)) {
      const [_, arg] = cap
      const times = +arg || 1
      const values = [], penalties = []
      for (let index = 0; index < times; index += 1) {
        const value = randomInt(100) + 1
        const tens = Math.floor(value / 10)
        const penalty = randomInt(10)
        penalties.push(penalty)
        values.push(Math.max(tens, penalty) * 10 + value % 10)
      }
      return meta.$send(`${options.getSenderName(meta)} 掷骰：${message.slice(1)}=${displayTotal(values)} (惩罚骰：${penalties.join(', ')})`)
    }

    if (cap = /^r((\d*)d)?(\d+)(\+((\d*)d)?(\d+))*$/i.exec(message)) {
      const expressions = message.slice(1).split('+')
      let hasMultiple = false
      let output = `${options.getSenderName(meta)} 掷骰：${message.slice(1)}=`
      let total = 0

      for (const expr of expressions) {
        const [_, dice, _times, _max] = /^((\d*)d)?(\d+)$/i.exec(expr)
        const max = +_max
        if (!max || max > options.maxPoint) {
          return meta.$send(`点数必须在 1 到 ${options.maxPoint} 之间。`)
        }

        if (!dice) {
          output += max + '+'
          total += max
          continue
        }

        const times = +(_times || 1)
        if (!times || times > options.maxTimes) {
          return meta.$send(`次数必须在 1 到 ${options.maxTimes} 之间。`)
        }

        const values = []
        for (let index = 0; index < times; index += 1) {
          const value = randomInt(max) + 1
          values.push(value)
          total += value
        }
        if (times > 1) hasMultiple = true
        if (times > 1 && expressions.length > 1) {
          output += '('
        }
        output += values.join('+')
        if (times > 1 && expressions.length > 1) {
          output += ')'
        }
        output += '+'
      }

      output = output.slice(0, -1)
      if (hasMultiple || expressions.length > 1) {
        output += '=' + total
      }
      return meta.$send(output)
    }

    return next()
  })
}
