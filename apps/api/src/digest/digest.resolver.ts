import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { Digest } from './digest.model'
import { DigestService } from './digest.service'

@Resolver(() => Digest)
export class DigestResolver {
  constructor(private readonly digestService: DigestService) {}

  @Query(() => [Digest])
  async digests(): Promise<Digest[]> {
    return await this.digestService.listDigests()
  }

  @Query(() => Digest, { nullable: true })
  async digest(@Args('date') date: string): Promise<Digest | null> {
    return await this.digestService.getDigest(date)
  }

  @Mutation(() => Digest, { nullable: true })
  async runDailyDigest(@Args('date', { nullable: true }) date?: string): Promise<Digest | null> {
    return await this.digestService.runDailyDigest(date)
  }
}


