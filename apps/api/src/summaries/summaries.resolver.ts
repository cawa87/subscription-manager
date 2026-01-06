import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql'
import { SummariesService } from './summaries.service'
import { Summary } from './summary.model'

@Resolver(() => Summary)
export class SummariesResolver {
  constructor(private readonly summaries: SummariesService) {}

  @Query(() => Summary, { nullable: true })
  async summary(@Args('itemId', { type: () => ID }) itemId: string): Promise<Summary | null> {
    return await this.summaries.getSummary(itemId)
  }

  @Mutation(() => Summary, { nullable: true })
  async summarizeItem(@Args('itemId', { type: () => ID }) itemId: string): Promise<Summary | null> {
    return await this.summaries.summarizeItem(itemId)
  }
}


