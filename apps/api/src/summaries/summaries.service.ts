import { Injectable } from '@nestjs/common'
import { and, eq } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'
import { AiService } from '../ai/ai.service'
import { DatabaseService } from '../db/db.service'
import { items, summaries } from '../db/schema'

@Injectable()
export class SummariesService {
  constructor(
    private readonly database: DatabaseService,
    private readonly ai: AiService
  ) {}

  async getSummary(itemId: string) {
    const model = this.ai.getModel()
    const rows = await this.database.db
      .select()
      .from(summaries)
      .where(and(eq(summaries.itemId, itemId), eq(summaries.model, model)))
      .limit(1)
    return rows[0] ?? null
  }

  async summarizeItem(itemId: string) {
    const existing = await this.getSummary(itemId)
    if (existing) return existing

    const itemRows = await this.database.db.select().from(items).where(eq(items.id, itemId)).limit(1)
    const item = itemRows[0]
    if (!item) return null

    const aiRes = await this.ai.summarizeItem({
      title: item.title,
      url: item.url,
      contentText: item.contentText ?? null
    })

    const now = new Date()
    const model = this.ai.getModel()
    const row = {
      id: randomUUID(),
      itemId,
      model,
      summary: aiRes.summary,
      keyPointsJson: aiRes.keyPoints.length ? JSON.stringify(aiRes.keyPoints) : null,
      sentiment: aiRes.sentiment,
      createdAt: now
    } satisfies typeof summaries.$inferInsert

    await this.database.db.insert(summaries).values(row).onConflictDoNothing({
      target: [summaries.itemId, summaries.model]
    })

    const created = await this.getSummary(itemId)
    return created
  }
}


