import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { SourcesService } from './sources.service'

@Injectable()
export class SourcesCron {
  constructor(private readonly sources: SourcesService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async tick(): Promise<void> {
    const now = Date.now()
    const due = await this.sources.listDueSources(now)
    for (const src of due) {
      await this.sources.fetchSourceNow(src.id)
    }
  }
}


