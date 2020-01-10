const axios = require('axios')
const sharp = require('sharp')

module.exports.name = 'latex'

module.exports.apply = (ctx) => {
  ctx.command('latex <code...>', 'LaTeX 渲染')
    .usage('渲染器由 https://www.zhihu.com/equation 提供。')
    .action(async ({ meta }, message) => {
      const tex = message.slice(message.indexOf('tex') + 3).trim()
      if (!tex) return meta.$send('请输入要渲染的 LaTeX 代码。')
      let { data: svg } = await axios.get<string>('https://www.zhihu.com/equation', {
        params: { tex },
      })
      const text = svg.match(/>([^<]+)<\/text>/)
      if (text) return meta.$send(text[1])
      const viewBox = svg.match(/ viewBox="0 (-?\d*(.\d+)?) -?\d*(.\d+)? -?\d*(.\d+)?" /)
      if (viewBox) {
        svg = svg.replace('\n', `\n<rect x="0" y="${viewBox[1]}" width="100%" height="100%" fill="white"></rect>\n`)
      }
      return meta.$send(`[CQ:image,file=base64://${(await sharp(Buffer.from(svg)).png().toBuffer()).toString('base64')}]`)
    })
}
