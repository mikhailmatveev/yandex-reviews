import { z } from 'zod'

export const apiReviewSchema = z.object({
  reviewId: z.string().optional(),

  author: z
    .object({
      name: z.string().optional()
    })
    .optional(),

  text: z.string().nullable().optional(),

  rating: z.number().optional(),

  updatedTime: z.string().optional(),

  createdTime: z.string().optional()
})

export const fetchReviewsResponseSchema = z.object({
  data: z
    .object({
      reviews: z.array(apiReviewSchema).optional()
    })
    .optional(),

  error: z
    .object({
      code: z.number().optional(),

      message: z.string().optional()
    })
    .optional()
})

export const parseResultSchema = z.object({
  sourceUrl: z.url(),

  externalId: z.string().min(1),

  name: z.string().min(1),

  rating: z.number().min(1).max(5),

  ratingCount: z.number().int().nonnegative(),

  reviewCount: z.number().int().nonnegative(),

  reviews: z.array(
    z.object({
      externalId: z.string().min(1).optional(),

      author: z.string().min(1),

      publishedAt: z.string().min(1),

      text: z.string().nullable(),

      rating: z.number().int().min(1).max(5)
    })
  )
})

export type FetchReviewsResponse = z.infer<typeof fetchReviewsResponseSchema>
