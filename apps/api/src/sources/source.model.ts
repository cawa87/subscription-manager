import { Field, ID, Int, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class Source {
  @Field(() => ID)
  id!: string

  @Field()
  name!: string

  @Field(() => String, { nullable: true })
  category!: string | null

  @Field()
  type!: string

  @Field()
  url!: string

  @Field(() => String, { nullable: true })
  contentType!: string | null

  @Field()
  enabled!: boolean

  @Field(() => Int)
  fetchIntervalMinutes!: number

  @Field(() => Date, { nullable: true })
  lastFetchedAt!: Date | null

  @Field(() => Date)
  createdAt!: Date
}


