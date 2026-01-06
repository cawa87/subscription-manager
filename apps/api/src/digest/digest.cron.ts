import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { DigestService } from './digest.service'

@Injectable()
export class DigestCron {
  constructor(private readonly digest: DigestService) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async tick(): Promise<void> {
    await this.digest.runDailyDigest()
  }
}


