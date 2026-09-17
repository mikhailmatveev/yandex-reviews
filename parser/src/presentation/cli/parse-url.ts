import { ParserError } from '../../domain/ParserError'
import type { ParseProgress } from '../../application/dto/ParseProgress'
import { createParseOrganization } from '../../composition-root'

const sourceUrl = process.argv[2]

if (!sourceUrl) {
  console.error('Usage: npm run parse:url -- <yandex-maps-url>')

  process.exit(1)
}

const reportProgress = async (progress: ParseProgress): Promise<void> => {
  console.error(JSON.stringify(progress))
}

try {
  const result = await createParseOrganization().execute(
    {
      sourceUrl
    },
    reportProgress
  )

  console.log(JSON.stringify(result, null, 2))
} catch (error) {
  if (error instanceof ParserError) {
    console.error(`${error.code}: ${error.message}`)
  } else {
    console.error(error)
  }

  process.exitCode = 1
}
