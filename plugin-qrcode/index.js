const { toDataURL } = require('qrcode')

module.exports.name = 'qrcode'

module.exports.apply = (ctx) => {
  ctx.command('qrcode <text>', '生成二维码')
    .option('-m, --margin <margin>', '边界尺寸', { type: Number, default: 4 })
    .option('-s, --scale <scale>', '比例系数', { type: Number, default: 4 })
    .option('-w, --width <width>', '图片大小', { type: Number, default: undefined })
    .option('-d, --dark <color>', '暗部颜色')
    .option('-l, --light <color>', '亮部颜色')
    .action(async ({ meta, options }, text) => {
      const { margin, scale, width, dark, light } = options
      const dataURL = await toDataURL(text, { margin, scale, width, color: { dark, light } })
      return meta.$send(`[CQ:image,file=base64://${dataURL.slice(22)}]`)
    })
}
