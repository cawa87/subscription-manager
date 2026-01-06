import { Field, ID, InputType, Int } from '@nestjs/graphql'

@InputType()
export class CreateSourceInput {
  @Field()
  name!: string

  @Field(() => String, { nullable: true })
  category!: string | null

  @Field()
  url!: string

  @Field({ defaultValue: 'rss' })
  type!: string

  @Field(() => String, { nullable: true })
  contentType!: string | null

  @Field({ defaultValue: true })
  enabled!: boolean

  @Field(() => Int, { defaultValue: 60 })
  fetchIntervalMinutes!: number
}

@InputType()
export class UpdateSourceInput {
  @Field(() => ID)
  id!: string

  @Field({ nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  category?: string | null

  @Field({ nullable: true })
  url?: string

  @Field({ nullable: true })
  type?: string

  @Field(() => String, { nullable: true })
  contentType?: string | null

  @Field({ nullable: true })
  enabled?: boolean

  @Field(() => Int, { nullable: true })
  fetchIntervalMinutes?: number
}


