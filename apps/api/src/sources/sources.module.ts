import { Module } from '@nestjs/common'
import { DatabaseModule } from '../db/db.module'
import { SourcesCron } from './sources.cron'
import { SourcesResolver } from './sources.resolver'
import { SourcesService } from './sources.service'

@Module({
  imports: [DatabaseModule],
  providers: [SourcesService, SourcesResolver, SourcesCron]
})
export class SourcesModule {}


