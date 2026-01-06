import { Module } from '@nestjs/common'
import { DatabaseModule } from '../db/db.module'
import { DigestCron } from './digest.cron'
import { DigestResolver } from './digest.resolver'
import { DigestService } from './digest.service'
import { TelegramService } from './telegram.service'

@Module({
  imports: [DatabaseModule],
  providers: [DigestService, DigestResolver, DigestCron, TelegramService]
})
export class DigestModule {}


