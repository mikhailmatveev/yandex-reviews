import { z } from 'zod'

import { ParserError } from '../../../domain/ParserError'

export class YandexMapsErrorMapper {
  public map(error: unknown): ParserError {
    if (error instanceof ParserError) {
      return error
    }

    if (error instanceof z.ZodError) {
      return new ParserError(
        'markup_changed',
        'The extracted data no longer matches the expected contract.'
      )
    }

    if (
      error instanceof Error &&
      (error.message.includes('net::ERR_') || error.name === 'TimeoutError')
    ) {
      return new ParserError(
        'source_unavailable',
        'Yandex Maps could not be reached.'
      )
    }

    return new ParserError(
      'temporary_error',
      'The parser could not complete the request.'
    )
  }
}
