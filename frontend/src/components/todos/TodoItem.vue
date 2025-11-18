<script setup lang="ts">
import { computed } from 'vue'
import type { Todo } from '../../types/todo'
import { formatRelativeFromNow, formatDateTime } from '../../utils/date'

const props = defineProps<{
  todo: Todo
}>()

const emit = defineEmits<{
  toggle: [id: string, completed: boolean]
  delete: [id: string]
  open: [id: string]
}>()

const dueText = computed(() =>
  props.todo.dueDate ? formatRelativeFromNow(props.todo.dueDate) : 'No due date',
)
</script>

<template>
  <article
    class="group flex items-start justify-between rounded-2xl border border-slate-200 bg-white/90 px-4 py-4 shadow-sm transition hover:border-slate-300"
  >
    <div class="flex flex-1 items-start gap-3">
      <button
        class="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full border-2 transition"
        :class="todo.completed ? 'border-lime-500 bg-lime-500 text-white' : 'border-slate-300'"
        @click="emit('toggle', todo.id, !todo.completed)"
      >
        <span v-if="todo.completed" class="text-xs font-bold">✓</span>
      </button>
      <div class="flex-1">
        <h3
          class="font-semibold text-slate-900"
          :class="todo.completed ? 'text-slate-400 line-through' : ''"
        >
          {{ todo.title }}
        </h3>
        <p v-if="todo.note" class="mt-1 text-sm text-slate-500">
          {{ todo.note }}
        </p>
        <p class="mt-2 text-xs uppercase tracking-wide text-slate-400">
          {{ dueText }}
          <span v-if="todo.dueDate" class="text-slate-300">·</span>
          <span v-if="todo.dueDate">{{ formatDateTime(todo.dueDate) }}</span>
        </p>
      </div>
    </div>
    <div class="flex gap-2 text-sm">
      <button class="text-slate-400 hover:text-slate-900" @click="emit('open', todo.id)">Open</button>
      <button class="text-rose-400 hover:text-rose-600" @click="emit('delete', todo.id)">
        Delete
      </button>
    </div>
  </article>
</template>
