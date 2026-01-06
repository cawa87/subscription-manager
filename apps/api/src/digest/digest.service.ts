import { Injectable } from '@nestjs/common'
import { and, desc, eq, gte, isNotNull } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'
import { DatabaseService } from '../db/db.service'
import { digests, items, sources } from '../db/schema'
import { TelegramService } from './telegram.service'

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10)
}

type DigestSectionsJson = {
  sections?: unknown
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

@Injectable()
export class DigestService {
  constructor(
    private readonly database: DatabaseService,
    private readonly telegram: TelegramService
  ) {}

  async listDigests(limit = 30) {
    return await this.database.db.select().from(digests).orderBy(desc(digests.date)).limit(limit)
  }

  async getDigest(date: string) {
    const rows = await this.database.db.select().from(digests).where(eq(digests.date, date)).limit(1)
    return rows[0] ?? null
  }

  async runDailyDigest(date?: string) {
    const target = date ?? isoDate(new Date())
    const since = new Date(`${target}T00:00:00.000Z`)

    const srcRows = await this.database.db.select().from(sources).where(eq(sources.enabled, true))
    const sourceById = new Map(srcRows.map((s) => [s.id, s]))

    const recent = await this.database.db
      .select()
      .from(items)
      .where(and(isNotNull(items.publishedAt), gte(items.publishedAt, since)))
      .orderBy(desc(items.publishedAt))
      .limit(50)

    const byCategory: Record<string, Array<{ title: string; url: string; sourceName: string }>> = {}
    for (const it of recent) {
      const src = sourceById.get(it.sourceId)
      const cat = src?.category ?? 'Uncategorized'
      if (!byCategory[cat]) byCategory[cat] = []
      byCategory[cat].push({ title: it.title, url: it.url, sourceName: src?.name ?? 'Unknown' })
    }

    const sections = Object.entries(byCategory)
      .sort((a, b) => b[1].length - a[1].length)
      .map(([category, list]) => ({
        title: category,
        items: list.slice(0, 10).map((x) => ({ title: x.title, url: x.url, sourceName: x.sourceName }))
      }))

    const count = recent.length
    const title = `Daily digest ${target}`
    const summary = count ? `Items: ${count}` : 'No items found for this day.'
    const sectionsJson = JSON.stringify({ sections })

    const row = {
      id: randomUUID(),
      date: target,
      title,
      summary,
      sectionsJson,
      createdAt: new Date()
    } satisfies typeof digests.$inferInsert

    await this.database.db
      .insert(digests)
      .values(row)
      .onConflictDoUpdate({ target: [digests.date], set: { title, summary, sectionsJson } })

    const saved = await this.getDigest(target)
    if (saved) await this.sendTelegram(saved)
    return saved
  }

  private async sendTelegram(digest: typeof digests.$inferSelect) {
    if (!this.telegram.isEnabled()) return
    let parsed: DigestSectionsJson | null = null
    try {
      const maybe = JSON.parse(digest.sectionsJson) as unknown
      parsed = isRecord(maybe) ? (maybe as DigestSectionsJson) : null
    } catch {
      parsed = null
    }

    const lines: string[] = [digest.title, digest.summary, '']
    const sections = Array.isArray(parsed?.sections) ? parsed.sections : []
    for (const s of sections.slice(0, 5)) {
      if (!isRecord(s)) continue
      const title = typeof s.title === 'string' ? s.title : ''
      const items = Array.isArray(s.items) ? s.items : []
      lines.push(title)
      for (const it of items.slice(0, 5)) {
        if (!isRecord(it)) continue
        const t = typeof it.title === 'string' ? it.title : ''
        const u = typeof it.url === 'string' ? it.url : ''
        const sn = typeof it.sourceName === 'string' ? it.sourceName : ''
        if (t && u && sn) lines.push(`- ${t} (${sn})\n  ${u}`)
        else if (t && u) lines.push(`- ${t}\n  ${u}`)
      }
      lines.push('')
    }

    const text = lines.join('\n').slice(0, 3500)
    await this.telegram.send(text)
  }
}


