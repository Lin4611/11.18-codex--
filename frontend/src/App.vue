<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <header class="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div class="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
        <div>
          <p class="text-xs uppercase tracking-wide text-slate-400">Vue TODO</p>
          <h1 class="text-lg font-semibold text-slate-900">Task Board</h1>
        </div>
        <nav class="text-sm text-slate-500">
          <RouterLink class="hover:text-slate-900" to="/">Dashboard</RouterLink>
        </nav>
      </div>
    </header>
    <main class="mx-auto max-w-4xl px-4 py-10">
      <RouterView />
    </main>
  </div>
</template>
