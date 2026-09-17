import { ParseOrganization } from './application/use-cases/ParseOrganization'

import { YandexMapsPageFactory } from './infrastructure/yandex-maps/browser/YandexMapsPageFactory'
import { YandexMapsErrorMapper } from './infrastructure/yandex-maps/errors/YandexMapsErrorMapper'
import { YandexMapsParser } from './infrastructure/yandex-maps/YandexMapsParser'
import { YandexMapsReviewCollector } from './infrastructure/yandex-maps/YandexMapsReviewCollector'
import { YandexMapsSummaryExtractor } from './infrastructure/yandex-maps/YandexMapsSummaryExtractor'

export const createParseOrganization = (): ParseOrganization => {
  const parser = new YandexMapsParser(
    new YandexMapsPageFactory(),
    new YandexMapsSummaryExtractor(),
    new YandexMapsReviewCollector(),
    new YandexMapsErrorMapper()
  )

  return new ParseOrganization(parser)
}
