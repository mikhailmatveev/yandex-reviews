import type { Review } from './Review'

export type Organization = {
  sourceUrl: string
  externalId: string
  name: string
  rating: number
  ratingCount: number
  reviewCount: number
  reviews: Review[]
}
