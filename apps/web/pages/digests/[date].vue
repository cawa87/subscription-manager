<template>
  <v-row>
    <v-col cols="12" md="8">
      <v-card v-if="digest">
        <v-card-title>{{ digest.title }}</v-card-title>
        <v-card-subtitle>{{ digest.summary }}</v-card-subtitle>
        <v-card-text class="d-flex flex-column ga-4">
          <div v-for="s in sections" :key="s.title">
            <div class="text-subtitle-2 mb-2">{{ s.title }}</div>
            <v-list density="compact">
              <v-list-item v-for="it in s.items" :key="it.url">
                <v-list-item-title>
                  <a :href="it.url" target="_blank" rel="noreferrer">{{ it.title }}</a>
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </div>
        </v-card-text>
      </v-card>
      <v-alert v-else type="warning" variant="tonal">Digest not found</v-alert>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
type Digest = { date: string; title: string; summary: string; sectionsJson: string }
type DigestSection = { title: string; items: Array<{ title: string; url: string }> }

const route = useRoute()
const { $gql } = useNuxtApp()

const date = computed(() => String(route.params.date))

const { data } = await useAsyncData(`digest:${date.value}`, async () => {
  const res = await $gql.request<{ digest: Digest | null }>(
    'query($date: String!) { digest(date: $date) { date title summary sectionsJson } }',
    { date: date.value }
  )
  return res.digest
})

const digest = computed(() => data.value ?? null)

const sections = computed<DigestSection[]>(() => {
  const raw = digest.value?.sectionsJson
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    const s = Array.isArray(parsed?.sections) ? parsed.sections : []
    return s
      .filter((x: any) => typeof x?.title === 'string' && Array.isArray(x?.items))
      .map((x: any) => ({
        title: x.title,
        items: x.items
          .filter((it: any) => typeof it?.title === 'string' && typeof it?.url === 'string')
          .slice(0, 10)
      }))
  } catch {
    return []
  }
})
</script>


