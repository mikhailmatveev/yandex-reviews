import {
  chromium,
  type Browser,
  type BrowserContext,
  type Page
} from 'patchright'

export class YandexMapsPageFactory {
  public async create(): Promise<{
    browser: Browser
    context: BrowserContext
    page: Page
  }> {
    const browser = await chromium.launch({
      headless: false
    })

    try {
      const context = await browser.newContext({
        locale: 'ru-RU',

        viewport: {
          width: 1440,
          height: 1100
        }
      })

      const page = await context.newPage()

      page.setDefaultTimeout(20_000)

      return {
        browser,
        context,
        page
      }
    } catch (error) {
      await browser.close()

      throw error
    }
  }
}
