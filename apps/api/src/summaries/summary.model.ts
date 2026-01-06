import { Field, ID, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class Summary {
  @Field(() => ID)
  id!: string

  @Field(() => ID)
  itemId!: string

  @Field()
  model!: string

  @Field()
  summary!: string

  @Field(() => String, { nullable: true })
  keyPointsJson!: string | null

  @Field(() => String, { nullable: true })
  sentiment!: string | null

  @Field(() => Date)
  createdAt!: Date
}


