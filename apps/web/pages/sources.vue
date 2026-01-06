<template>
  <v-row>
    <v-col cols="12" md="5">
      <v-card>
        <v-card-title>Add source</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="onCreate">
            <v-text-field v-model="form.name" label="Name" />
            <v-text-field v-model="form.category" label="Category" />
            <v-text-field v-model="form.url" label="RSS URL" />
            <v-text-field v-model="form.contentType" label="Content type" />
            <v-text-field
              v-model.number="form.fetchIntervalMinutes"
              type="number"
              label="Fetch interval (minutes)"
            />
            <v-switch v-model="form.enabled" label="Enabled" />
            <v-btn type="submit" block :loading="creating">Create</v-btn>
            <v-btn block variant="tonal" class="mt-2" :loading="creating" @click="onSeed">
              Seed MVP sources
            </v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" md="7">
      <v-card>
        <v-card-title>Sources</v-card-title>
        <v-card-text>
          <v-alert v-if="error" type="error" variant="tonal">{{ error }}</v-alert>
          <v-table>
            <thead>
              <tr>
                <th>Name</th>
                <th class="d-none d-sm-table-cell">Category</th>
                <th class="d-none d-sm-table-cell">URL</th>
                <th class="d-none d-md-table-cell">Content</th>
                <th>Enabled</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in sources" :key="s.id">
                <td>{{ s.name }}</td>
                <td class="d-none d-sm-table-cell">{{ s.category ?? '' }}</td>
                <td class="d-none d-sm-table-cell">
                  <a :href="s.url" target="_blank" rel="noreferrer">{{ s.url }}</a>
                </td>
                <td class="d-none d-md-table-cell">{{ s.contentType ?? '' }}</td>
                <td>
                  <v-chip :color="s.enabled ? 'green' : 'grey'" size="small">
                    {{ s.enabled ? 'on' : 'off' }}
                  </v-chip>
                </td>
                <td class="text-right">
                  <v-btn size="small" variant="text" @click="onFetch(s.id)">Fetch</v-btn>
                  <v-btn size="small" variant="text" @click="onToggle(s.id)">Toggle</v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
type Source = {
  id: string
  name: string
  category: string | null
  url: string
  contentType: string | null
  enabled: boolean
  fetchIntervalMinutes: number
}

const { $gql } = useNuxtApp()

const error = ref<string | null>(null)
const creating = ref(false)

const form = reactive({
  name: 'Dev.to',
  category: 'General',
  url: 'https://dev.to/feed',
  contentType: 'Community posts (Wide net)',
  enabled: true,
  fetchIntervalMinutes: 60
})

const { data, refresh } = await useAsyncData('sources', async () => {
  const res = await $gql.request<{ sources: Source[] }>(
    'query { sources { id name category url contentType enabled fetchIntervalMinutes } }'
  )
  return res.sources
})

const sources = computed(() => data.value ?? [])

async function onCreate() {
  error.value = null
  creating.value = true
  try {
    await $gql.request(
      'mutation($input: CreateSourceInput!) { createSource(input: $input) { id } }',
      { input: form }
    )
    await refresh()
  } catch (e: any) {
    error.value = e?.message ?? 'Failed to create source'
  } finally {
    creating.value = false
  }
}

async function onSeed() {
  error.value = null
  creating.value = true
  try {
    await $gql.request('mutation { seedMvpSources }')
    await refresh()
  } catch (e: any) {
    error.value = e?.message ?? 'Seed failed'
  } finally {
    creating.value = false
  }
}

async function onFetch(id: string) {
  error.value = null
  try {
    await $gql.request('mutation($id: ID!) { fetchSourceNow(sourceId: $id) }', { id })
  } catch (e: any) {
    error.value = e?.message ?? 'Fetch failed'
  }
}

async function onToggle(id: string) {
  error.value = null
  try {
    await $gql.request('mutation($id: ID!) { toggleSourceEnabled(id: $id) { id } }', { id })
    await refresh()
  } catch (e: any) {
    error.value = e?.message ?? 'Toggle failed'
  }
}
</script>


