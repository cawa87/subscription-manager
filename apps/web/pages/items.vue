<template>
  <v-row>
    <v-col cols="12">
      <v-card>
        <v-card-title>Items</v-card-title>
        <v-card-text>
          <v-alert v-if="error" type="error" variant="tonal">{{ error }}</v-alert>
          <v-table>
            <thead>
              <tr>
                <th>Title</th>
                <th class="d-none d-md-table-cell">Author</th>
                <th class="d-none d-sm-table-cell">Published</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="it in items" :key="it.id">
                <td>
                  <NuxtLink :to="`/items/${it.id}`">{{ it.title }}</NuxtLink>
                </td>
                <td class="d-none d-md-table-cell">{{ it.author ?? '' }}</td>
                <td class="d-none d-sm-table-cell">{{ formatDate(it.publishedAt) }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>
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
}

const { $gql } = useNuxtApp()

const error = ref<string | null>(null)

const { data } = await useAsyncData('items', async () => {
  const res = await $gql.request<{ items: Item[] }>(
    'query { items(filters: { limit: 50 }) { id title url author publishedAt } }'
  )
  return res.items
})

const items = computed(() => data.value ?? [])

function formatDate(value: string | null) {
  if (!value) return ''
  return new Date(value).toLocaleString()
}
</script>


