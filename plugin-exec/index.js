const { CQCode } = require('koishi-utils')
const { exec } = require('child_process')

module.exports.name = 'exec'

module.exports.apply = (ctx, options) => {
  ctx.command('exec <expression...>', '执行命令行', { authority: 4 })
    .shortcut('$', { fuzzy: true, oneArg: true })
    .action(async ({ meta }, expression) => {
      if (!expression) return
      expression = CQCode.unescape(expression)
      const child = exec(expression)
      child.stdout.on('data', data => meta.$send(String(data).trim()))
      child.stderr.on('data', data => meta.$send(String(data).trim()))
    })
}
