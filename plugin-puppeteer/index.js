const puppeteer = require('puppeteer-core')

module.exports.name = 'puppeteer'

module.exports.apply = (ctx, options = {}) => {
  if (!options.executablePath) {
    options.executablePath = puppeteer.executablePath()
  }

  const logger = ctx.logger('puppeteer')
  const browserPromise = puppeteer.launch(options)

  browserPromise.then(() => logger.info('browser launched'))

  ctx.command('screenshot <url>', '网页截图')
    .alias('shot')
    .option('-f, --full-page', '对整个可滚动区域截图')
    .action(async ({ meta, options }, url) => {
      let browser, page
      try {
        browser = await browserPromise
      } catch (error) {
        logger.warn(error)
        return meta.$send('无法启动浏览器。')
      }

      try {
        page = await browser.newPage()
        await page.goto(url)
        logger.debug(`navigated to ${url}`)
      } catch (error) {
        logger.warn(error)
        return meta.$send('无法打开页面。')
      }

      const data = await page.screenshot({
        encoding: 'base64',
        fullPage: options.fullPage,
      }) 
      return meta.$send(`[CQ:image,file=base64://${data}]`)
    })
}
