import type { ParseOrganizationOutput } from '../dto/ParserOrganizationOutput'
import type { ParseProgress } from '../dto/ParseProgress'

export interface OrganizationParser {
  parse(
    sourceUrl: string,
    reportProgress: (progress: ParseProgress) => Promise<void>
  ): Promise<ParseOrganizationOutput>
}
