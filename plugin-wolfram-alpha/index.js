const { CQCode } = require('koishi-utils')
const { xml2js } = require('xml-js')
const axios = require('axios')

function extractData (subpod, inline = false) {
  const text = subpod.plaintext && subpod.plaintext._text
  if (text && text.match(/^[a-zA-Z0-9 "',?!;:()-]+$/)) {
    return text
  } else if (subpod.img) {
    const { src, height } = subpod.img._attributes
    return (height >= 30 && inline ? '\n' : '') + CQCode.stringify('image', { file: src })
  }
}

module.exports.name = 'wolfram-alpha'

/**
 * @param { import('koishi-core').Context } ctx context
 */
module.exports.apply = (ctx, { appid } = {}) => {
  if (!appid) throw new Error('missing configuration "appid"')

  ctx.command('alpha <expression...>', '调用 WolframAlpha 查询', { maxUsage: 10 })
    .example('alpha int(sinx)')
    .action(async ({ meta }, message) => {
      const input = message.slice(message.indexOf('alpha') + 5).trim()
      if (!input) return meta.$send('请输入问题')
      try {
        const { data } = await axios.get('http://api.wolframalpha.com/v2/query', {
          params: { input, appid },
        })
        const { queryresult } = xml2js(data, { compact: true })
        if (queryresult._attributes.success !== 'true') {
          return meta.$send('failed')
        }
        const output = [`Question from ${meta.sender.card || meta.sender.nickname}: ${input}`]
        queryresult.pod.forEach((el) => {
          if (Array.isArray(el.subpod)) {
            output.push(el._attributes.title + ': ', ...el.subpod.map(extractData).filter(t => t))
          } else {
            const text = extractData(el.subpod, true)
            if (!text) return
            output.push(el._attributes.title + ': ' + text)
          }
        })
        return meta.$send(output.join('\n'))
      } catch (error) {
        console.log(error.toJSON())
      }
    })
    .subcommand('.short <expression...>', '调用 WolframAlpha 短问答', { maxUsage: 10, usageName: 'alpha' })
    .example('alpha.short How big is the universe?')
    .action(async ({ meta }, message) => {
      const input = message.slice(message.indexOf('alpha.short') + 11).trim()
      if (!input) return meta.$send('请输入问题')
      try {
        const { data } = await axios.get('http://api.wolframalpha.com/v1/result', {
          params: { input, appid },
        })
        return meta.$send(data)
      } catch (error) {
        console.log(error.toJSON())
      }
    })
}
