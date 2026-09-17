import type { ParseOrganizationInput } from '../dto/ParserOrganizationInput'
import type { ParseOrganizationOutput } from '../dto/ParserOrganizationOutput'
import type { ReportProgress } from '../dto/ParseProgress'
import type { OrganizationParser } from '../ports/OrganizationParser'

export class ParseOrganization {
  public constructor(private readonly parser: OrganizationParser) {}

  public execute(
    input: ParseOrganizationInput,
    reportProgress: ReportProgress
  ): Promise<ParseOrganizationOutput> {
    return this.parser.parse(input.sourceUrl, reportProgress)
  }
}
