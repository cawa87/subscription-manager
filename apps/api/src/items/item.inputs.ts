import { Field, ID, InputType, Int } from '@nestjs/graphql'

@InputType()
export class ItemsFilterInput {
  @Field(() => ID, { nullable: true })
  sourceId?: string

  @Field(() => Int, { defaultValue: 50 })
  limit!: number
}


