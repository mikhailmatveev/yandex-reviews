import type { Locator, Page } from 'patchright'

import { ParserError } from '../../domain/ParserError'
import type { YandexMapsPage } from './browser/YandexMapsPage'
import { selectors } from './Selectors'

export type OrganizationSummary = {
  name: string
  rating: number
  ratingCount: number
  reviewCount: number
}

export class YandexMapsSummaryExtractor {
  public async extract(page: YandexMapsPage): Promise<OrganizationSummary> {
    const rawPage = page.raw

    const name = await this.firstText(rawPage, selectors.organizationName)

    const ratingText = await this.firstText(rawPage, selectors.rating)

    const ratingCountText = await this.firstText(rawPage, selectors.ratingCount)

    const reviewCountText = await this.firstText(rawPage, selectors.reviewCount)

    const rating = this.parseRating(ratingText)

    const ratingCount = this.parseCount(ratingCountText)

    const parsedReviewCount = this.parseCount(reviewCountText)

    const fallbackReviewCount = await this.extractReviewCount(rawPage)

    const reviewCount = parsedReviewCount ?? fallbackReviewCount

    if (
      !name ||
      rating === null ||
      ratingCount === null ||
      reviewCount === null
    ) {
      throw new ParserError(
        'markup_changed',
        'Required organization summary fields were not found.'
      )
    }

    return {
      name,
      rating,
      ratingCount,
      reviewCount
    }
  }

  private async extractReviewCount(page: Page): Promise<number | null> {
    const locator = page.locator('meta[itemprop="reviewCount"]').first()

    const content = await locator.getAttribute('content')

    if (!content) {
      return null
    }

    const value = Number(content)

    return Number.isInteger(value) && value >= 0 ? value : null
  }

  private async firstText(
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

  private parseRating(value: string | null): number | null {
    if (!value) {
      return null
    }

    const match = value.replace(',', '.').match(/[1-5](?:\.\d+)?/)

    return match ? Number(match[0]) : null
  }

  private parseCount(value: string | null): number | null {
    if (!value) {
      return null
    }

    const digits = value.replace(/[^\d]/g, '')

    return digits ? Number(digits) : null
  }
}
