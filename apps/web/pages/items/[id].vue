<template>
  <v-row>
    <v-col cols="12" md="8">
      <v-card v-if="item">
        <v-card-title>{{ item.title }}</v-card-title>
        <v-card-subtitle>
          <span v-if="item.author">{{ item.author }}</span>
          <span v-if="item.publishedAt"> · {{ formatDate(item.publishedAt) }}</span>
        </v-card-subtitle>
        <v-card-text class="d-flex flex-column ga-2">
          <v-btn
            :href="item.url"
            target="_blank"
            rel="noreferrer"
            variant="tonal"
            class="align-self-start"
          >
            Open original
          </v-btn>

          <v-divider />

          <div class="text-subtitle-2">AI summary</div>
          <v-alert v-if="error" type="error" variant="tonal">{{ error }}</v-alert>

          <div v-if="summary" class="text-body-1" style="white-space: pre-wrap">
            {{ summary.summary }}
          </div>
          <div v-else class="text-body-2">No summary yet.</div>

          <v-btn
            class="align-self-start"
            :loading="summarizing"
            variant="flat"
            @click="onSummarize"
          >
            Summarize
          </v-btn>
        </v-card-text>
      </v-card>

      <v-alert v-else type="warning" variant="tonal">Item not found</v-alert>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
type Item = {
  id: string
  title: string
  url: string
  author: string | null
  publishedAt: string | null
  contentText: string | null
}

type Summary = {
  id: string
  itemId: string
  model: string
  summary: string
  createdAt: string
}

const route = useRoute()
const { $gql } = useNuxtApp()

const id = computed(() => String(route.params.id))
const error = ref<string | null>(null)
const summarizing = ref(false)

const { data: itemData } = await useAsyncData(`item:${id.value}`, async () => {
  const res = await $gql.request<{ item: Item | null }>(
    'query($id: ID!) { item(id: $id) { id title url author publishedAt contentText } }',
    { id: id.value }
  )
  return res.item
})

const item = computed(() => itemData.value ?? null)

const { data: summaryData, refresh: refreshSummary } = await useAsyncData(
  `summary:${id.value}`,
  async () => {
    const res = await $gql.request<{ summary: Summary | null }>(
      'query($id: ID!) { summary(itemId: $id) { id itemId model summary createdAt } }',
      { id: id.value }
    )
    return res.summary
  }
)

const summary = computed(() => summaryData.value ?? null)

async function onSummarize() {
  error.value = null
  summarizing.value = true
  try {
    await $gql.request('mutation($id: ID!) { summarizeItem(itemId: $id) { id } }', { id: id.value })
    await refreshSummary()
  } catch (e: any) {
    error.value = e?.message ?? 'Summarization failed'
  } finally {
    summarizing.value = false
  }
}

function formatDate(value: string) {
  return new Date(value).toLocaleString()
}
</script>


