<template>
  <v-row>
    <v-col cols="12" md="8" lg="6">
      <v-card>
        <v-card-title>Daily IT/dev digest</v-card-title>
        <v-card-text>
          Add sources, ingest items, and read a daily digest grouped by tags and
          topics.
        </v-card-text>
        <v-divider />
        <v-card-text>
          <div class="text-caption">API check</div>
          <div class="text-body-2">{{ pingText }}</div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
const { $gql } = useNuxtApp()

const { data } = await useAsyncData('ping', async () => {
  return await $gql.request<{ ping: string }>('query Ping { ping }')
})

const pingText = computed(() => data.value?.ping ?? 'unavailable')
</script>


