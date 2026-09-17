export type ParseProgress = {
  stage: 'opening_page' | 'reading_summary' | 'collecting_reviews'

  collected_reviews: number

  expected_reviews: number | null
}

export type ReportProgress = (progress: ParseProgress) => Promise<void>
