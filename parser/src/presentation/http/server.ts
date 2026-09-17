import express from 'express'
import { z } from 'zod'

import { ParserError } from '../../domain/ParserError'
import type { ParseProgress } from '../../application/dto/ParseProgress'
import { createParseOrganization } from '../../composition-root'

const requestSchema = z.object({
  url: z.url(),
  runId: z.number().int().positive()
})

const port = Number(process.env.PORT ?? 3000)

const token = process.env.PARSER_TOKEN

const callbackUrl = process.env.CALLBACK_URL

if (!token || !callbackUrl) {
  throw new Error('PARSER_TOKEN and CALLBACK_URL must be configured.')
}

const app = express()

app.use(
  express.json({
    limit: '16kb'
  })
)

app.get('/health', (_request, response) => {
  response.json({
    status: 'ok'
  })
})

app.post('/parse', async (request, response) => {
  if (request.header('authorization') !== `Bearer ${token}`) {
    return response.sendStatus(401)
  }

  const input = requestSchema.safeParse(request.body)

  if (!input.success) {
    return response.status(422).json({
      code: 'invalid_request',

      message: 'Invalid parser request.'
    })
  }

  const reportProgress = async (progress: ParseProgress): Promise<void> => {
    const callbackResponse = await fetch(callbackUrl, {
      method: 'POST',

      headers: {
        authorization: `Bearer ${token}`,

        'content-type': 'application/json'
      },

      body: JSON.stringify({
        run_id: input.data.runId,

        ...progress
      }),

      signal: AbortSignal.timeout(5_000)
    })

    if (!callbackResponse.ok) {
      throw new Error(`Progress callback failed: ${callbackResponse.status}`)
    }
  }

  try {
    const result = await createParseOrganization().execute(
      {
        sourceUrl: input.data.url
      },
      reportProgress
    )

    return response.json(result)
  } catch (error) {
    if (error instanceof ParserError) {
      return response.status(thisHttpStatus(error.code)).json({
        code: error.code,

        message: error.message
      })
    }

    console.error(error)

    return response.status(500).json({
      code: 'temporary_error',

      message: 'Unexpected parser error.'
    })
  }
})

function thisHttpStatus(code: ParserError['code']): number {
  switch (code) {
    case 'invalid_url':
    case 'markup_changed':
    case 'incomplete_result':
      return 422

    case 'access_limited':
      return 429

    case 'source_unavailable':
    case 'temporary_error':
      return 503
  }
}

app.listen(port, () => {
  console.log(`Parser worker listens on port ${port}.`)
})
