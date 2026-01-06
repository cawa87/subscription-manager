import { Injectable } from '@nestjs/common'

type ChatCompletionResponse = {
  choices?: Array<{
    message?: { content?: string | null } | null
  }>
}

type SummaryJson = {
  summary?: unknown
  keyPoints?: unknown
  sentiment?: unknown
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  const out: string[] = []
  for (const v of value) {
    if (typeof v === 'string') out.push(v)
  }
  return out
}

@Injectable()
export class AiService {
  private readonly baseUrl = process.env.AI_BASE_URL ?? 'https://api.openai.com/v1'
  private readonly apiKey = process.env.AI_API_KEY ?? ''
  private readonly model = process.env.AI_MODEL ?? 'gpt-4o-mini'

  getModel() {
    return this.model
  }

  async summarizeItem(input: {
    title: string
    url: string
    contentText?: string | null
  }): Promise<{ summary: string; keyPoints: string[]; sentiment: string | null }> {
    if (!this.apiKey) {
      throw new Error('Missing AI_API_KEY')
    }

    const body = {
      model: this.model,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You help a developer stay up to date. Return compact JSON with: summary (string), keyPoints (string[]), sentiment (string).'
        },
        {
          role: 'user',
          content: JSON.stringify({
            title: input.title,
            url: input.url,
            content: input.contentText ?? ''
          })
        }
      ]
    }

    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${this.apiKey}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    if (!res.ok) throw new Error(`AI request failed: ${res.status}`)

    const json = (await res.json()) as ChatCompletionResponse
    const content = json.choices?.[0]?.message?.content ?? ''

    let parsed: SummaryJson | null = null
    try {
      const maybe = JSON.parse(content) as unknown
      parsed = isRecord(maybe) ? (maybe as SummaryJson) : null
    } catch {
      parsed = null
    }

    const summary = typeof parsed?.summary === 'string' ? parsed.summary : String(content ?? '')
    const keyPoints = toStringArray(parsed?.keyPoints)
    const sentiment = typeof parsed?.sentiment === 'string' ? parsed.sentiment : null

    return { summary, keyPoints, sentiment }
  }
}


