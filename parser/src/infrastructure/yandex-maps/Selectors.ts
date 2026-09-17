export const selectors = {
  reviewTab: [
    'a[href*="reviews"]',
    'button:has-text("Отзывы")',
    '[role="tab"]:has-text("Отзывы")'
  ],

  reviewContainer: [
    '[data-testid="reviews-list"]',
    '[class*="business-reviews-card-view__reviews-container"]',
    '[class*="reviews-list"]'
  ],

  reviewCard: ['div.business-review-view'],

  organizationName: [
    'h1',
    '[itemprop="name"]',
    '[class*="business-card-title"]'
  ],

  rating: [
    '[itemprop="ratingValue"]',
    '[class*="business-summary-rating-badge-view"]',
    '[aria-label*="рейтинг"]'
  ],

  ratingCount: ['[itemprop="ratingCount"]', '[class*="rating-count"]'],

  reviewCount: ['[itemprop="reviewCount"]', '[class*="reviews-count"]'],

  reviewAuthor: ['.business-review-view__author-name'],

  reviewDate: ['.business-review-view__date'],

  reviewText: ['.business-review-view__body'],

  reviewRating: ['span[itemprop="reviewRating"] [itemprop="ratingValue"]']
} as const
