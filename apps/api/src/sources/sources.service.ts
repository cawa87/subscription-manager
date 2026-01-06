import { Injectable, OnModuleInit } from '@nestjs/common'
import { desc, eq } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'
import { DatabaseService } from '../db/db.service'
import { items, sources } from '../db/schema'
import { CreateSourceInput, UpdateSourceInput } from './source.inputs'
import Parser from 'rss-parser'

type RssItem = {
  title?: string
  link?: string
  pubDate?: string
  isoDate?: string
  creator?: string
  content?: string
  contentSnippet?: string
}

type RssFeed = {
  title?: string
  items: RssItem[]
}

@Injectable()
export class SourcesService implements OnModuleInit {
  private readonly parser = new Parser<RssFeed, RssItem>()

  constructor(private readonly database: DatabaseService) {}

  async onModuleInit(): Promise<void> {
    await this.database.db.delete(sources).where(eq(sources.url, 'https://dev.to/feed/'))
    const existing = await this.database.db.select({ id: sources.id }).from(sources).limit(1)
    if (existing.length === 0) {
      await this.seedMvpSources()
    }
  }

  private normalizeUrl(url: string) {
    if (url === 'https://dev.to/feed/') return 'https://dev.to/feed'
    return url
  }

  async listSources() {
    const rows = await this.database.db.select().from(sources).orderBy(desc(sources.createdAt))
    return rows
  }

  async createSource(input: CreateSourceInput) {
    const now = new Date()
    const row = {
      id: randomUUID(),
      name: input.name,
      category: input.category,
      type: input.type,
      url: this.normalizeUrl(input.url),
      contentType: input.contentType,
      enabled: input.enabled,
      fetchIntervalMinutes: input.fetchIntervalMinutes,
      lastFetchedAt: null,
      createdAt: now
    }

    await this.database.db.insert(sources).values(row)
    return row
  }

  async updateSource(input: UpdateSourceInput) {
    const existing = await this.database.db
      .select()
      .from(sources)
      .where(eq(sources.id, input.id))
      .limit(1)
    if (!existing[0]) return null

    const patch: Partial<typeof sources.$inferInsert> = {}
    if (input.name !== undefined) patch.name = input.name
    if (input.category !== undefined) patch.category = input.category
    if (input.url !== undefined) patch.url = this.normalizeUrl(input.url)
    if (input.type !== undefined) patch.type = input.type
    if (input.contentType !== undefined) patch.contentType = input.contentType
    if (input.enabled !== undefined) patch.enabled = input.enabled
    if (input.fetchIntervalMinutes !== undefined)
      patch.fetchIntervalMinutes = input.fetchIntervalMinutes

    if (Object.keys(patch).length) {
      await this.database.db.update(sources).set(patch).where(eq(sources.id, input.id))
    }

    const updated = await this.database.db
      .select()
      .from(sources)
      .where(eq(sources.id, input.id))
      .limit(1)
    return updated[0]
  }

  async deleteSource(id: string) {
    const res = await this.database.db.delete(sources).where(eq(sources.id, id))
    return res.changes > 0
  }

  async toggleSourceEnabled(id: string) {
    const existing = await this.database.db.select().from(sources).where(eq(sources.id, id)).limit(1)
    if (!existing[0]) return null
    const next = !existing[0].enabled
    await this.database.db.update(sources).set({ enabled: next }).where(eq(sources.id, id))
    const updated = await this.database.db.select().from(sources).where(eq(sources.id, id)).limit(1)
    return updated[0]
  }

  async seedMvpSources() {
    const list = [
      {
        category: 'AI / ML',
        name: 'OpenAI Blog',
        url: 'https://openai.com/blog/rss.xml',
        contentType: 'Major releases & research'
      },
      {
        category: 'AI / ML',
        name: 'Hugging Face',
        url: 'https://huggingface.co/blog/feed.xml',
        contentType: 'Open-source models & tutorials'
      },
      {
        category: 'AI / ML',
        name: 'TheSequence',
        url: 'https://thesequence.substack.com/feed',
        contentType: 'Technical paper breakdowns'
      },
      {
        category: 'AI / ML',
        name: 'Google DeepMind',
        url: 'https://deepmind.google/blog/rss.xml',
        contentType: 'Deep research breakthroughs'
      },
      {
        category: 'AI / ML',
        name: 'Last Week in AI',
        url: 'https://lastweekinai.substack.com/feed',
        contentType: 'Weekly news summaries'
      },
      {
        category: 'JS / TS',
        name: 'V8 (Google)',
        url: 'https://v8.dev/blog.atom',
        contentType: 'JS Engine internals'
      },
      {
        category: 'JS / TS',
        name: 'Smashing Magazine',
        url: 'https://www.smashingmagazine.com/feed/',
        contentType: 'Frontend, UX, CSS/JS'
      },
      {
        category: 'JS / TS',
        name: 'Overreacted',
        url: 'https://overreacted.io/rss.xml',
        contentType: 'Deep React concepts'
      },
      {
        category: 'JS / TS',
        name: 'Node.js Blog',
        url: 'https://nodejs.org/en/feed/blog.xml',
        contentType: 'Server-side JS updates'
      },
      {
        category: 'JS / TS',
        name: 'Nuxt Blog',
        url: 'https://nuxt.com/blog.xml',
        contentType: 'Framework specific (Your Stack)'
      },
      {
        category: 'JS / TS',
        name: 'NestJS Blog',
        url: 'https://trilon.io/blog/feed.xml',
        contentType: 'Framework specific (Your Stack)'
      },
      {
        category: 'PHP',
        name: 'Laravel News',
        url: 'https://feed.laravel-news.com/',
        contentType: 'Framework ecosystem news'
      },
      {
        category: 'PHP',
        name: 'Stitcher.io',
        url: 'https://stitcher.io/rss',
        contentType: 'Core PHP & Async concepts'
      },
      {
        category: 'PHP',
        name: 'PHP.net',
        url: 'https://www.php.net/news.rss',
        contentType: 'Official language releases'
      },
      {
        category: 'PHP',
        name: 'Freek.dev',
        url: 'https://freek.dev/feed/',
        contentType: 'Packages & workflow'
      },
      {
        category: 'Go',
        name: 'The Go Blog',
        url: 'https://go.dev/blog/feed.atom',
        contentType: 'Official language updates'
      },
      {
        category: 'Go',
        name: 'Dave Cheney',
        url: 'https://dave.cheney.net/feed',
        contentType: 'High-level Go design'
      },
      {
        category: 'Go',
        name: 'Ardan Labs',
        url: 'https://www.ardanlabs.com/blog/index.xml',
        contentType: 'Concurrency & Engineering'
      },
      {
        category: 'Go',
        name: 'Applied Go',
        url: 'https://appliedgo.net/index.xml',
        contentType: 'Practical tutorials'
      },
      {
        category: 'General',
        name: 'Lobste.rs',
        url: 'https://lobste.rs/rss',
        contentType: 'High-signal engineering discussion'
      },
      {
        category: 'General',
        name: 'Uber Engineering',
        url: 'https://www.uber.com/en-US/blog/engineering/rss/',
        contentType: 'High-scale architecture'
      },
      {
        category: 'General',
        name: 'Netflix Tech',
        url: 'https://netflixtechblog.com/feed',
        contentType: 'DevOps, Data & Scale'
      },
      {
        category: 'General',
        name: 'Martin Fowler',
        url: 'https://martinfowler.com/feed.atom',
        contentType: 'Architecture patterns'
      },
      {
        category: 'General',
        name: 'Dev.to',
        url: 'https://dev.to/feed',
        contentType: 'Community posts (Wide net)'
      }
    ] as const

    let inserted = 0
    for (const s of list) {
      const now = new Date()
      const row = {
        id: randomUUID(),
        name: s.name,
        category: s.category,
        type: 'rss',
        url: s.url,
        contentType: s.contentType,
        enabled: true,
        fetchIntervalMinutes: 60,
        lastFetchedAt: null,
        createdAt: now
      } satisfies typeof sources.$inferInsert

      const res = await this.database.db
        .insert(sources)
        .values(row)
        .onConflictDoNothing({ target: [sources.url] })
      if (res.changes > 0) inserted += 1
    }

    return inserted
  }

  async listDueSources(now: number) {
    const all = await this.database.db.select().from(sources).where(eq(sources.enabled, true))
    return all.filter((s) => {
      const last = s.lastFetchedAt ? s.lastFetchedAt.getTime() : 0
      return now - last >= s.fetchIntervalMinutes * 60_000
    })
  }

  async fetchSourceNow(sourceId: string) {
    const src = await this.database.db.select().from(sources).where(eq(sources.id, sourceId)).limit(1)
    if (!src[0]) return 0
    const inserted = await this.fetchAndStore(src[0])
    await this.database.db
      .update(sources)
      .set({ lastFetchedAt: new Date() })
      .where(eq(sources.id, sourceId))
    return inserted
  }

  async fetchAndStore(source: typeof sources.$inferSelect) {
    const res = await fetch(source.url)
    if (!res.ok) return 0
    const xml = await res.text()
    const feed = await this.parser.parseString(xml)
    const now = new Date()

    let insertedCount = 0
    for (const it of feed.items ?? []) {
      const url = it.link ?? ''
      const title = (it.title ?? '').trim()
      if (!url || !title) continue

      const publishedAtRaw = it.isoDate ?? it.pubDate ?? null
      const publishedAt = publishedAtRaw ? new Date(publishedAtRaw) : null

      const row = {
        id: randomUUID(),
        sourceId: source.id,
        url,
        title,
        author: it.creator ?? null,
        publishedAt,
        contentText: it.contentSnippet ?? null,
        contentHtml: it.content ?? null,
        language: null,
        hash: null,
        createdAt: now
      } satisfies typeof items.$inferInsert

      const result = await this.database.db
        .insert(items)
        .values(row)
        .onConflictDoNothing({ target: [items.sourceId, items.url] })
      if (result.changes > 0) insertedCount += 1
    }

    return insertedCount
  }

  async listItems(sourceId?: string, limit = 50) {
    const base = this.database.db
      .select()
      .from(items)
      .orderBy(desc(items.publishedAt), desc(items.createdAt))
      .limit(limit)

    const rows = sourceId ? await base.where(eq(items.sourceId, sourceId)) : await base
    return rows
  }

  async getItem(id: string) {
    const rows = await this.database.db.select().from(items).where(eq(items.id, id)).limit(1)
    return rows[0] ?? null
  }
}


