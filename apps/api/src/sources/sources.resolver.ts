import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql'
import { Item } from '../items/item.model'
import { ItemsFilterInput } from '../items/item.inputs'
import { Source } from './source.model'
import { CreateSourceInput, UpdateSourceInput } from './source.inputs'
import { SourcesService } from './sources.service'

@Resolver()
export class SourcesResolver {
  constructor(private readonly sourcesService: SourcesService) {}

  @Query(() => [Source])
  async sources(): Promise<Source[]> {
    return await this.sourcesService.listSources()
  }

  @Mutation(() => Source)
  async createSource(@Args('input') input: CreateSourceInput): Promise<Source> {
    return await this.sourcesService.createSource(input)
  }

  @Mutation(() => Source, { nullable: true })
  async updateSource(@Args('input') input: UpdateSourceInput): Promise<Source | null> {
    return await this.sourcesService.updateSource(input)
  }

  @Mutation(() => Boolean)
  async deleteSource(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return await this.sourcesService.deleteSource(id)
  }

  @Mutation(() => Source, { nullable: true })
  async toggleSourceEnabled(@Args('id', { type: () => ID }) id: string): Promise<Source | null> {
    return await this.sourcesService.toggleSourceEnabled(id)
  }

  @Mutation(() => Number)
  async fetchSourceNow(@Args('sourceId', { type: () => ID }) sourceId: string): Promise<number> {
    return await this.sourcesService.fetchSourceNow(sourceId)
  }

  @Mutation(() => Number)
  async seedMvpSources(): Promise<number> {
    return await this.sourcesService.seedMvpSources()
  }

  @Query(() => [Item])
  async items(@Args('filters', { nullable: true }) filters?: ItemsFilterInput): Promise<Item[]> {
    return await this.sourcesService.listItems(filters?.sourceId, filters?.limit ?? 50)
  }

  @Query(() => Item, { nullable: true })
  async item(@Args('id', { type: () => ID }) id: string): Promise<Item | null> {
    return await this.sourcesService.getItem(id)
  }
}


