import { Module } from '@nestjs/common'
import { AiService } from '../ai/ai.service'
import { DatabaseModule } from '../db/db.module'
import { SummariesResolver } from './summaries.resolver'
import { SummariesService } from './summaries.service'

@Module({
  imports: [DatabaseModule],
  providers: [AiService, SummariesService, SummariesResolver]
})
export class SummariesModule {}


