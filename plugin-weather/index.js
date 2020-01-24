const axios = require('axios')

const lang = 'zh-CN'
const unit = 'metric'

module.exports.name = 'weather'

module.exports.apply = (ctx) => {
  ctx.command('weather <longitude> <latitude>', '查询天气')
    .action(async ({ meta }, message) => {
      const [lon, lat] = message.slice(message.indexOf('weather') + 7).trim().split(' ')
      if (!lon || !lat) return meta.$send('请输入经纬度')
      try {
        const { data } = await axios.get('http://www.7timer.info/bin/civil.php', {
          params: { lon, lat, lang, unit },
          responseType: 'arraybuffer',
        })
        return meta.$send(`[CQ:image,file=base64://${data.toString('base64')}]`)
      } catch (error) {
        console.log(error.toJSON())
      }
    })
}
