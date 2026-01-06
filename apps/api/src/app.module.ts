import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { ScheduleModule } from '@nestjs/schedule'
import { join } from 'path'
import { DatabaseModule } from './db/db.module'
import { HealthResolver } from './health.resolver'
import { DigestModule } from './digest/digest.module'
import { SourcesModule } from './sources/sources.module'
import { SummariesModule } from './summaries/summaries.module'

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'schema.gql'),
      sortSchema: true,
      playground: true
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    SourcesModule,
    SummariesModule,
    DigestModule
  ],
  providers: [HealthResolver]
})
export class AppModule {}
