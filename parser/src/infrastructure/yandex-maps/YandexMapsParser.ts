import type { Organization } from '../../domain/Organization'
import { ParserError } from '../../domain/ParserError'

import type { ReportProgress } from '../../application/dto/ParseProgress'
import type { OrganizationParser } from '../../application/ports/OrganizationParser'

import { YandexMapsPageFactory } from './browser/YandexMapsPageFactory'
import { YandexMapsPage } from './browser/YandexMapsPage'
import { YandexMapsErrorMapper } from './errors/YandexMapsErrorMapper'
import { YandexMapsReviewCollector } from './YandexMapsReviewCollector'
import { YandexMapsSummaryExtractor } from './YandexMapsSummaryExtractor'
import { parseResultSchema } from './Schemas'

export class YandexMapsParser implements OrganizationParser {
  public constructor(
    private readonly browserFactory: YandexMapsPageFactory,
    private readonly summaryExtractor: YandexMapsSummaryExtractor,
    private readonly reviewCollector: YandexMapsReviewCollector,
    private readonly errorMapper: YandexMapsErrorMapper
  ) {}

  public async parse(
    sourceUrl: string,
    reportProgress: ReportProgress
  ): Promise<Organization> {
    this.assertYandexMapsUrl(sourceUrl)

    const { browser, page: rawPage } = await this.browserFactory.create()

    const page = new YandexMapsPage(rawPage)

    try {
      await reportProgress({
        stage: 'opening_page',

        collected_reviews: 0,

        expected_reviews: null
      })

      await page.open(sourceUrl)

      if (!page.isReviewsPage()) {
        await page.openReviews()
      }

      await reportProgress({
        stage: 'reading_summary',

        collected_reviews: 0,

        expected_reviews: null
      })

      const summary = await this.summaryExtractor.extract(page)

      const reviews = await this.reviewCollector.collect(
        page,
        summary.reviewCount,
        reportProgress
      )

      if (summary.reviewCount > 0 && reviews.length === 0) {
        throw new ParserError(
          'incomplete_result',
          'The page reports reviews, but none were extracted.'
        )
      }

      return parseResultSchema.parse({
        sourceUrl,

        externalId: this.extractOrganizationId(page.getUrl()),

        name: summary.name,

        rating: summary.rating,

        ratingCount: summary.ratingCount,

        reviewCount: summary.reviewCount,

        reviews
      })
    } catch (error) {
      throw this.errorMapper.map(error)
    } finally {
      await browser.close()
    }
  }

  private assertYandexMapsUrl(value: string): void {
    let url: URL

    try {
      url = new URL(value)
    } catch {
      throw new ParserError(
        'invalid_url',
        'Only valid Yandex Maps organization URLs are supported.'
      )
    }

    const isYandexDomain =
      url.hostname === 'yandex.ru' ||
      url.hostname.endsWith('.yandex.ru') ||
      url.hostname === 'yandex.com' ||
      url.hostname.endsWith('.yandex.com')

    if (!isYandexDomain || !url.pathname.includes('/maps')) {
      throw new ParserError(
        'invalid_url',
        'Only Yandex Maps organization URLs are supported.'
      )
    }
  }

  private extractOrganizationId(url: string): string {
    const match = url.match(/\/org\/[^/]+\/(\d+)/)

    if (!match) {
      throw new ParserError(
        'markup_changed',
        'Organization ID was not found in the final URL.'
      )
    }

    return match[1]
  }
}
