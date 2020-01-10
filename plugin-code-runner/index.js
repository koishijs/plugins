const { CQCode } = require('koishi-utils')
const { readFileSync } = require('fs')
const { formatWithOptions } = require('util')
const { VM } = require('vm2')

const script = readFileSync(__dirname + '/script.js', 'utf8')

const defaultOptions = {
  globalName: 'koishi',
  maxTimeout: 4000,
  maxLogCount: 4,
}

function format (format: string, ...param: any[]) {
  return formatWithOptions({ depth: 1 }, format, ...param)
}

export default function apply (ctx, options) {
  options = { ...defaultOptions, ...options }

  const vm = new VM({
    timeout: options.maxTimeout,
    sandbox: {},
  })

  const koishi = new class Koishi {
    log = (message: string, ...args: any[]) => {
      if (++this.logCount > options.maxLogCount) return
      return meta.$send(format(message, ...args))
    }
  }

  vm.freeze(koishi, options.globalName)
  vm.run(script)

  ctx.command('vm <expression...>', '执行 JavaScript 脚本', { authority: 3 })
    .shortcut('>', { fuzzy: true, oneArg: true })
    .shortcut('>>', { fuzzy: true, oneArg: true, options: { output: true } })
    .option('-o, --output', '输出最后的结果')
    .action(async ({ meta, options }, expression) => {
      if (!expression) return
      Object.defineProperties(koishi, {
        logCount: { value: 0, writable: true },
        meta: { value: meta, writable: true },
      })

      try {
        const result = await vm.run(CQCode.unescape(expression))
        if (result !== undefined && options.output) return koishi.log(result)
      } catch (error) {
        if (error.message === 'Script execution timed out.') {
          return meta.$send('执行超时。')
        } else if (error.name === 'SyntaxError') {
          const lines = error.stack.split('\n')
          return meta.$send(`${lines[4]}\n    at ${lines[0].replace(/vm\.js/g, 'stdin')}:${lines[2].length}`)
        } else {
          return meta.$send(error.stack.replace(/\s*.+Script[\s\S]*/, '').replace(/vm\.js/g, 'stdin'))
        }
      }
    })
}
