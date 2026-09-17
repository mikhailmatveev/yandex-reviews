import type { Locator, Response } from 'patchright'

import type { ReportProgress } from '../../application/dto/ParseProgress.js'
import type { Review } from '../../domain/Review.js'

import type { YandexMapsPage } from './browser/YandexMapsPage.js'
import { fetchReviewsResponseSchema } from './Schemas'
import { selectors } from './Selectors'

export class YandexMapsReviewCollector {
  public async collect(
    page: YandexMapsPage,
    expectedReviewCount: number,
    reportProgress: ReportProgress
  ): Promise<Review[]> {
    const container = await page.firstVisibleLocator(selectors.reviewContainer)

    const reviews = new Map<string, Review>()

    const renderedReviews = await this.extractRenderedReviews(container)

    for (const review of renderedReviews) {
      const key =
        review.externalId ??
        `${review.author}|${review.publishedAt}|${review.rating}|${review.text ?? ''}`

      reviews.set(key, review)
    }

    await reportProgress({
      stage: 'collecting_reviews',

      collected_reviews: reviews.size,

      expected_reviews: expectedReviewCount
    })

    const apiReviews = new Map<string, Review>()

    const responseHandler = async (response: Response): Promise<void> => {
      const request = response.request()

      if (
        request.resourceType() !== 'fetch' &&
        request.resourceType() !== 'xhr'
      ) {
        return
      }

      if (!response.url().includes('/api/business/fetchReviews')) {
        return
      }

      if (response.status() >= 400) {
        return
      }

      let body

      try {
        body = fetchReviewsResponseSchema.parse(await response.json())
      } catch {
        return
      }

      for (const review of body.data?.reviews ?? []) {
        const reviewId = review.reviewId

        const author = review.author?.name?.trim()

        const publishedAt = review.createdTime ?? review.updatedTime

        const rating = review.rating

        if (
          !reviewId ||
          !author ||
          !publishedAt ||
          !Number.isInteger(rating) ||
          rating < 1 ||
          rating > 5
        ) {
          continue
        }

        apiReviews.set(reviewId, {
          externalId: reviewId,

          author,

          publishedAt,

          text: review.text ?? null,

          rating
        })
      }
    }

    page.onResponse(responseHandler)

    try {
      for (let pageNumber = 2; pageNumber <= 12; pageNumber++) {
        const currentContainer = await page.firstVisibleLocator(
          selectors.reviewContainer
        )

        const cards = currentContainer.locator(selectors.reviewCard.join(', '))

        const cardCount = await cards.count()

        if (cardCount === 0) {
          break
        }

        await cards.nth(cardCount - 1).scrollIntoViewIfNeeded()

        await page.wait(2500)

        await page.assertAvailable()

        await reportProgress({
          stage: 'collecting_reviews',

          collected_reviews: reviews.size + apiReviews.size,

          expected_reviews: expectedReviewCount
        })
      }
    } finally {
      page.offResponse(responseHandler)
    }

    for (const [reviewId, review] of apiReviews) {
      reviews.set(reviewId, review)
    }

    await reportProgress({
      stage: 'collecting_reviews',

      collected_reviews: reviews.size,

      expected_reviews: expectedReviewCount
    })

    return [...reviews.values()]
  }

  private async extractRenderedReviews(container: Locator): Promise<Review[]> {
    const cards = container.locator(selectors.reviewCard.join(', '))

    const count = await cards.count()

    const reviews: Review[] = []

    for (let index = 0; index < count; index++) {
      const card = cards.nth(index)

      const author = await this.firstText(card, selectors.reviewAuthor)

      const dateLocator = card.locator('meta[itemprop="datePublished"]').first()

      const publishedAt = await dateLocator.getAttribute('content')

      const ratingLocator = card
        .locator('span[itemprop="reviewRating"] [itemprop="ratingValue"]')
        .first()

      const ratingContent = await ratingLocator.getAttribute('content')

      const rating = ratingContent ? Number(ratingContent) : null

      const text = await this.firstText(card, selectors.reviewText)

      if (
        !author ||
        !publishedAt ||
        rating === null ||
        !Number.isInteger(rating) ||
        rating < 1 ||
        rating > 5
      ) {
        continue
      }

      const externalId =
        (await card.getAttribute('data-review-id')) ??
        (await card.getAttribute('id')) ??
        undefined

      reviews.push({
        externalId,
        author,
        publishedAt,
        text,
        rating
      })
    }

    return reviews
  }

  private async firstText(
    parent: Locator,
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
}
