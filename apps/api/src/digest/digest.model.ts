import { Field, ID, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class Digest {
  @Field(() => ID)
  id!: string

  @Field()
  date!: string

  @Field()
  title!: string

  @Field()
  summary!: string

  @Field()
  sectionsJson!: string

  @Field(() => Date)
  createdAt!: Date
}


