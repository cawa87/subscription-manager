import { index, integer, real, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core'

export const sources = sqliteTable(
  'sources',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    category: text('category'),
    type: text('type').notNull(),
    url: text('url').notNull(),
    contentType: text('content_type'),
    enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
    fetchIntervalMinutes: integer('fetch_interval_minutes').notNull().default(60),
    lastFetchedAt: integer('last_fetched_at', { mode: 'timestamp_ms' }),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull()
  },
  (t) => ({
    urlUnique: unique().on(t.url)
  })
)

export const items = sqliteTable(
  'items',
  {
    id: text('id').primaryKey(),
    sourceId: text('source_id')
      .notNull()
      .references(() => sources.id, { onDelete: 'cascade' }),
    url: text('url').notNull(),
    title: text('title').notNull(),
    author: text('author'),
    publishedAt: integer('published_at', { mode: 'timestamp_ms' }),
    contentText: text('content_text'),
    contentHtml: text('content_html'),
    language: text('language'),
    hash: text('hash'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull()
  },
  (t) => ({
    sourceUrlUnique: unique().on(t.sourceId, t.url),
    sourcePublishedAtIdx: index('items_source_published_at_idx').on(t.sourceId, t.publishedAt)
  })
)

export const tags = sqliteTable(
  'tags',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull()
  },
  (t) => ({
    nameUnique: unique().on(t.name)
  })
)

export const itemTags = sqliteTable(
  'item_tags',
  {
    itemId: text('item_id')
      .notNull()
      .references(() => items.id, { onDelete: 'cascade' }),
    tagId: text('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' })
  },
  (t) => ({
    pk: unique().on(t.itemId, t.tagId),
    tagIdx: index('item_tags_tag_idx').on(t.tagId)
  })
)

export const topics = sqliteTable(
  'topics',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    prompt: text('prompt').notNull()
  },
  (t) => ({
    nameUnique: unique().on(t.name)
  })
)

export const itemTopics = sqliteTable(
  'item_topics',
  {
    itemId: text('item_id')
      .notNull()
      .references(() => items.id, { onDelete: 'cascade' }),
    topicId: text('topic_id')
      .notNull()
      .references(() => topics.id, { onDelete: 'cascade' }),
    score: real('score').notNull().default(0)
  },
  (t) => ({
    pk: unique().on(t.itemId, t.topicId),
    topicIdx: index('item_topics_topic_idx').on(t.topicId)
  })
)

export const summaries = sqliteTable(
  'summaries',
  {
    id: text('id').primaryKey(),
    itemId: text('item_id')
      .notNull()
      .references(() => items.id, { onDelete: 'cascade' }),
    model: text('model').notNull(),
    summary: text('summary').notNull(),
    keyPointsJson: text('key_points_json'),
    sentiment: text('sentiment'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull()
  },
  (t) => ({
    itemIdx: index('summaries_item_idx').on(t.itemId),
    itemModelUnique: unique().on(t.itemId, t.model)
  })
)

export const digests = sqliteTable(
  'digests',
  {
    id: text('id').primaryKey(),
    date: text('date').notNull(),
    title: text('title').notNull(),
    summary: text('summary').notNull(),
    sectionsJson: text('sections_json').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull()
  },
  (t) => ({
    dateUnique: unique().on(t.date)
  })
)


