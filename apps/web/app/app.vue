<template>
  <v-app>
    <v-app-bar title="IT Knowledge Digest">
      <template #append>
        <v-btn to="/sources" variant="text">Sources</v-btn>
        <v-btn to="/items" variant="text">Items</v-btn>
        <v-btn to="/digests" variant="text">Digests</v-btn>
      </template>
    </v-app-bar>
    <v-main>
      <v-container class="py-4">
        <NuxtPage />
      </v-container>
    </v-main>
  </v-app>
</template>
