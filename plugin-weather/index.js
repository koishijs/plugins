const axios = require('axios')

const lang = 'zh-CN'
const unit = 'metric'
const products = ['astro', 'civil', 'civillight', 'meteo', 'two']

module.exports.name = 'weather'

module.exports.apply = (ctx) => {
  ctx.command('weather <longitude> <latitude>', '查询天气')
    .option('-p, --product <product>', `晴天钟产品选择，可为 ${products.join(', ')}`, { default: 'civil' })
    .action(async ({ meta, options }, lon, lat) => {
      if (!lon || !lat) return meta.$send('请输入经纬度')
      const { product } = options
      if (!products.includes(options.product)) return meta.$send(`不支持该产品，产品选择应为 ${products.join(', ')} 之一`)
      try {
        const { data } = await axios.get(`http://www.7timer.info/bin/${product}.php`, {
          params: { lon, lat, lang, unit },
          responseType: 'arraybuffer',
        })
        return meta.$send(`[CQ:image,file=base64://${data.toString('base64')}]`)
      } catch (error) {
        console.log(error.toJSON())
      }
    })
}
