import { Field, ID, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class Item {
  @Field(() => ID)
  id!: string

  @Field(() => ID)
  sourceId!: string

  @Field()
  url!: string

  @Field()
  title!: string

  @Field(() => String, { nullable: true })
  author!: string | null

  @Field(() => Date, { nullable: true })
  publishedAt!: Date | null

  @Field(() => String, { nullable: true })
  contentText!: string | null

  @Field(() => String, { nullable: true })
  contentHtml!: string | null

  @Field(() => String, { nullable: true })
  language!: string | null

  @Field(() => String, { nullable: true })
  hash!: string | null

  @Field(() => Date)
  createdAt!: Date
}


