import type { Locator, Page, Response } from 'patchright'

import { ParserError } from '../../../domain/ParserError'
import { selectors } from '../Selectors'

export class YandexMapsPage {
  public constructor(private readonly page: Page) {}

  public get raw(): Page {
    return this.page
  }

  public async open(sourceUrl: string): Promise<void> {
    const response = await this.page.goto(sourceUrl, {
      waitUntil: 'domcontentloaded',

      timeout: 45_000
    })

    await this.page.waitForTimeout(1000)

    if (!response || response.status() >= 500) {
      throw new ParserError(
        'source_unavailable',
        'Yandex Maps is temporarily unavailable.'
      )
    }

    await this.assertAvailable()
  }

  public async assertAvailable(): Promise<void> {
    const content = (await this.page.locator('body').innerText()).toLowerCase()

    if (
      content === 'limited' ||
      content.includes('captcha') ||
      content.includes('доступ ограничен') ||
      content.includes('слишком много запросов')
    ) {
      throw new ParserError(
        'access_limited',
        'Yandex Maps limited access to this request.'
      )
    }
  }

  public async openReviews(): Promise<void> {
    for (const selector of selectors.reviewTab) {
      const tab = this.page.locator(selector).first()

      if (await tab.isVisible().catch(() => false)) {
        await tab.click()

        await this.page.waitForTimeout(700)

        return
      }
    }

    throw new ParserError('markup_changed', 'The reviews tab was not found.')
  }

  public isReviewsPage(): boolean {
    return this.page.url().includes('/reviews')
  }

  public async wait(milliseconds: number): Promise<void> {
    await this.page.waitForTimeout(milliseconds)
  }

  public onResponse(
    handler: (response: Response) => void | Promise<void>
  ): void {
    this.page.on('response', handler)
  }

  public offResponse(
    handler: (response: Response) => void | Promise<void>
  ): void {
    this.page.off('response', handler)
  }

  public async firstVisibleLocator(
    candidates: readonly string[]
  ): Promise<Locator> {
    for (const selector of candidates) {
      const locator = this.page.locator(selector).first()

      if (await locator.isVisible().catch(() => false)) {
        return locator
      }
    }

    throw new ParserError(
      'markup_changed',
      'The reviews container was not found.'
    )
  }

  public async firstText(
    parent: Page | Locator,
    candidates: readonly string[]
  ): Promise<string | null> {
    for (const selector of candidates) {
      const locator = parent.locator(selector).first()

      if (await locator.isVisible().catch(() => false)) {
        const text = (await locator.innerText()).replace(/\s+/g, ' ').trim()

        if (text) {
          return text
        }
      }
    }

    return null
  }

  public getUrl(): string {
    return this.page.url()
  }
}
