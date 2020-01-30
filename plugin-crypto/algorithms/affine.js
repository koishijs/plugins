const { getOffset, modInverse, modPositive } = require('./utils')

module.exports = class Affine {
  constructor(a, b) {
    this.a = a
    this.b = b
    this.c = modInverse(a, 26)
  }

  encrypt (text) {
    let output = ''
    for (const char of text) {
      const offset = getOffset(char)
      if (offset) {
        output += String.fromCharCode(modPositive(this.a * (char.charCodeAt(0) - offset) + this.b, 26) + offset)
      } else {
        output += char
      }
    }
    return output
  }

  decrypt (text) {
    let output = ''
    for (let char of text) {
      const offset = getOffset(char)
      if (offset) {
        output += String.fromCharCode(modPositive(this.c * (char.charCodeAt(0) - offset - this.b), 26) + offset)
      } else {
        output += char
      }
    }
    return output
  }
}
