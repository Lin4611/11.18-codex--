<script setup lang="ts">
import type { TodoStatusFilter } from '../../types/todo'

const props = defineProps<{
  value: TodoStatusFilter
  counts: {
    all: number
    active: number
    completed: number
  }
}>()

const emit = defineEmits<{
  change: [filter: TodoStatusFilter]
}>()

const options: { label: string; value: TodoStatusFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
]

function onChange(value: TodoStatusFilter) {
  emit('change', value)
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-2 text-sm">
    <button
      v-for="option in options"
      :key="option.value"
      class="rounded-full border px-4 py-1 transition"
      :class="
        option.value === value
          ? 'border-slate-900 bg-slate-900 text-white'
          : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-900'
      "
      @click="onChange(option.value)"
    >
      {{ option.label }}
      <span class="ml-1 text-xs text-white/80" v-if="option.value === value">
        {{
          option.value === 'all'
            ? counts.all
            : option.value === 'active'
              ? counts.active
              : counts.completed
        }}
      </span>
    </button>
  </div>
</template>
