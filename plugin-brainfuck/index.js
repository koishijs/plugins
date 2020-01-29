const { CQCode } = require('koishi-utils')

const defaultOptions = {
  cellSize: 8,
  memorySize: 1024,
  maxSteps: 16384,
}

class BFError extends Error {
  constructor (message) {
    super(message)
    this.name = 'BFError'
  }
}

class BrainFuck {
  /**
   * @param {string} source source code
   * @param {object} options options
   */
  constructor (source, options = {}) {
    this.options = {
      ...defaultOptions,
      ...options,
    }
    this.source = source
    this.data = [0]
    this.pointer = 0
    this.mask = (1 << this.options.cellSize) - 1
    /** @type { Record<number, number> } */
    this.map = {}
  }

  exec (input = '') {
    let output = ''
    let index = 0
    let step = 0
    while (index < this.source.length) {
      switch (this.source.charCodeAt(index)) {
        case 43: // '+'
          this.data[this.pointer] = ++this.data[this.pointer] & this.mask
          break

        case 45: // '-'
          this.data[this.pointer] = --this.data[this.pointer] & this.mask
          break

        case 62: // '>'
          if (++this.pointer >= this.options.memorySize) {
            throw new BFError('max memory exceed')
          }
          if (this.data[this.pointer] === undefined) {
            this.data[this.pointer] = 0
          }
          break

        case 60: // '<'
          if (!this.pointer) {
            throw new BFError('negative pointer')
          }
          --this.pointer
          break

        case 46: // '.'
          output += String.fromCharCode(this.data[this.pointer])
          break

        case 44: // ','
          this.data[this.pointer] = input.charCodeAt(0)
          input = input.slice(1)
          break

        case 91: // '['
          const next = this.findMatch(index)
          if (!this.data[this.pointer]) {
            index = next
          }
          break

        case 93: // ']'
          if (this.map[index] === undefined) {
            throw new BFError(`no matching "[" at position ${index}`)
          }
          if (this.data[this.pointer]) {
            index = this.map[index]
          }
      }

      ++index
      if (++step === this.options.maxSteps) {
        throw new BFError('max step exceeded')
      }
    }
    return output
  }

  /**
   * find matching `]`
   * @param {number} index character position
   */
  findMatch (index) {
    let next = this.map[index]
    if (next) return next

    next = index + 1
    while (next < this.source.length && this.source.charCodeAt(next) !== 93) {
      if (this.source.charCodeAt(next) === 91) {
        next = this.findMatch(next)
      }
      ++next
    }

    if (next === this.source.length) {
      throw new BFError(`no matching "]" at position ${index}`)
    }
    this.map[next] = index
    return this.map[index] = next
  }
}

module.exports.name = 'brainfuck'

/**
 * @param { import('koishi-core').Context } ctx context
 */
module.exports.apply = (ctx, _options) => {
  ctx.command('brainfuck <source>', '运行 brainfuck 代码')
    .alias('bf')
    .option('-i, --input <input>', '设置输入', { isString: true, default: '' })
    .action(async ({ meta, options }, source) => {
      if (!source) return meta.$send('请输入源代码。')
      try {
        return meta.$send(new BrainFuck(CQCode.unescape(source)).exec(CQCode.unescape(options.input)))
      } catch (error) {
        if (error.name === 'BFError') {
          return meta.$send(error.message)
        }
      }
    })
}
