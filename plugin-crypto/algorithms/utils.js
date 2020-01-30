const { isInteger } = require('koishi-utils')

function mod (n, m) {
  return n >= 0 ? n % m : n % m + m
}

function modPositive (n, m) {
  return mod(n, m) || m
}

function bezout (a, b) {
  if (!isInteger(a) || !isInteger(b)) {
    throw new Error('Expect integer.')
  }

  let x = 0, y = 1, u = 1, v = 0
  while (a != 0) {
    const q = Math.floor(b / a)
    const r = b % a
    const m = x - u * q
    const n = y - v * q
    b = a
    a = r
    x = u
    y = v
    u = m
    v = n
  }
  return [b, x, y]
}

function modInverse (a, m) {
  const [gcd, x] = bezout(a, m)
  return gcd !== 1 ? null : x % m
}

function isKeyword (source) {
  return /^[a-zA-Z]+$/.exec(source)
}

function getOffset (char) {
  if ('A' <= char && char <= 'Z') return 64
  if ('a' <= char && char <= 'z') return 96
}

function deleteDuplicate (source) {
  let result = ''
  for (const char of source) {
    if (!result.includes(char)) result += char
  }
  return result
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const DIGITS = '0123456789'

class Square {
  constructor (type, keyword = '') {
    let size, source = keyword.toUpperCase() + ALPHABET
    if (type === '25ij') {
      size = 5
      source = source.replace(/J/g, 'I')
    } else if (type === '25q') {
      size = 5
      source = source.replace(/Q/g, '')
    } else if (type === '36') {
      size = 6
      source += DIGITS
    } else {
      throw new Error('Invalid type.')
    }

    this.data = []
    this.map = {}
    source = deleteDuplicate(source)
    for (let i = 0; i < size; ++ i) {
      const row = source.slice(i * size, i * size + size)
      this.data[i] = []
      for (let j = 0; j < size; ++ j) {
        this.data[i][j] = row.charCodeAt(j) - 64
        this.map[row[j]] = [i, j]
        this.map[row[j].toLowerCase()] = [i, j]
      }
    }
  }
}

module.exports = {
  mod,
  modPositive,
  modInverse,
  bezout,
  isKeyword,
  getOffset,
  deleteDuplicate,
  Square,
}
