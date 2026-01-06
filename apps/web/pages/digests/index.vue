<template>
  <v-row>
    <v-col cols="12" md="8">
      <v-card>
        <v-card-title class="d-flex align-center justify-space-between">
          <span>Digests</span>
          <v-btn :loading="running" variant="flat" @click="onRun">Run today</v-btn>
        </v-card-title>
        <v-card-text>
          <v-alert v-if="error" type="error" variant="tonal">{{ error }}</v-alert>
          <v-table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Title</th>
                <th class="d-none d-sm-table-cell">Summary</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="d in digests" :key="d.date">
                <td>
                  <NuxtLink :to="`/digests/${d.date}`">{{ d.date }}</NuxtLink>
                </td>
                <td>{{ d.title }}</td>
                <td class="d-none d-sm-table-cell">{{ d.summary }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
type Digest = { date: string; title: string; summary: string }

const { $gql } = useNuxtApp()
const error = ref<string | null>(null)
const running = ref(false)

const { data, refresh } = await useAsyncData('digests', async () => {
  const res = await $gql.request<{ digests: Digest[] }>('query { digests { date title summary } }')
  return res.digests
})

const digests = computed(() => data.value ?? [])

async function onRun() {
  error.value = null
  running.value = true
  try {
    await $gql.request('mutation { runDailyDigest { date } }')
    await refresh()
  } catch (e: any) {
    error.value = e?.message ?? 'Failed to run digest'
  } finally {
    running.value = false
  }
}
</script>


