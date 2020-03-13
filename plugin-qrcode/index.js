const { toDataURL } = require('qrcode')

module.exports.name = 'qrcode'

module.exports.apply = (ctx) => {
  ctx.command('qrcode <text...>', '生成二维码')
    .option('-m, --margin <margin>', '边界尺寸', { default: 4 })
    .option('-s, --scale <scale>', '比例系数', { default: 4 })
    .option('-w, --width <width>', '图片大小', { default: undefined })
    .option('-d, --dark <color>', '暗部颜色')
    .option('-l, --light <color>', '亮部颜色')
    .action(async ({ meta, options }, text) => {
      if (!text) {
        return meta.$send('请输入源文本。')
      }
      if (text.includes('[CQ:')) {
        return meta.$send('称呼中禁止包含纯文本以外的内容。')
      }
      const { margin, scale, width, dark, light } = options
      const dataURL = await toDataURL(text, { margin, scale, width, color: { dark, light } })
      return meta.$send(`[CQ:image,file=base64://${dataURL.slice(22)}]`)
    })
}
