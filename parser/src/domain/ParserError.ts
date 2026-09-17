export type ParserErrorCode =
  | 'invalid_url'
  | 'source_unavailable'
  | 'access_limited'
  | 'markup_changed'
  | 'incomplete_result'
  | 'temporary_error'

export class ParserError extends Error {
  public constructor(
    public readonly code: ParserErrorCode,
    message: string
  ) {
    super(message)

    this.name = 'ParserError'
  }
}
