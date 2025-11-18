<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TodoForm from '../components/todos/TodoForm.vue'
import { useTodos } from '../composables/useTodos'
import type { Todo } from '../types/todo'
import { formatDateTime } from '../utils/date'

const route = useRoute()
const router = useRouter()
const { items, getTodo, patchTodo, replaceTodo, deleteTodo } = useTodos()

const todo = ref<Todo | null>(null)
const loading = ref(true)
const saving = ref(false)
const error = ref<string | null>(null)

const todoId = computed(() => route.params.id as string)

async function loadTodo() {
  loading.value = true
  error.value = null
  const existing = items.value.find((t) => t.id === todoId.value)
  if (existing) {
    todo.value = existing
    loading.value = false
    return
  }
  try {
    todo.value = await getTodo(todoId.value)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to load todo.'
  } finally {
    loading.value = false
  }
}

async function handleToggle() {
  if (!todo.value) return
  const next = !todo.value.completed
  const updated = await patchTodo(todoId.value, { completed: next })
  todo.value = updated
}

async function handleSubmit(payload: { title: string; note?: string; dueDate?: string | null }) {
  if (!todo.value) return
  saving.value = true
  try {
    const updated = await replaceTodo(todoId.value, {
      ...payload,
      completed: todo.value.completed,
    })
    todo.value = updated
  } finally {
    saving.value = false
  }
}

async function handleDelete() {
  const confirmed = window.confirm('Delete this todo?')
  if (!confirmed) return
  await deleteTodo(todoId.value)
  router.push({ name: 'todo-board' })
}

onMounted(loadTodo)
watch(todoId, () => {
  loadTodo()
})
</script>

<template>
  <section class="space-y-6">
    <button class="text-sm text-slate-500 hover:text-slate-900" @click="router.push('/')">
      ← Back to list
    </button>

    <div v-if="loading" class="space-y-3">
      <div class="h-6 w-1/2 animate-pulse rounded bg-slate-200"></div>
      <div class="h-56 animate-pulse rounded-2xl bg-white"></div>
    </div>

    <div v-else-if="error" class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-rose-600">
      {{ error }}
    </div>

    <div v-else-if="todo" class="space-y-6">
      <header class="rounded-2xl border border-slate-200 bg-white/90 px-6 py-6">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p class="text-xs uppercase tracking-wide text-slate-400">Todo ID</p>
            <p class="font-mono text-sm text-slate-600">{{ todo.id }}</p>
          </div>
          <button
            class="rounded-full border px-4 py-1 text-sm"
            :class="
              todo.completed
                ? 'border-lime-500 bg-lime-500/10 text-lime-700'
                : 'border-amber-400 bg-amber-50 text-amber-600'
            "
            @click="handleToggle"
          >
            {{ todo.completed ? 'Completed' : 'Mark complete' }}
          </button>
        </div>
        <p class="mt-4 text-sm text-slate-500">
          Created: {{ formatDateTime(todo.createdAt) }} · Updated: {{ formatDateTime(todo.updatedAt) }}
        </p>
      </header>

      <div class="rounded-2xl border border-slate-200 bg-white/90 px-6 py-6 shadow-sm">
        <p class="mb-4 text-sm font-semibold text-slate-600">Edit details</p>
        <TodoForm
          :initial="{ title: todo.title, note: todo.note, dueDate: todo.dueDate }"
          submit-label="Save changes"
          :busy="saving"
          @submit="handleSubmit"
        />
        <button
          class="mt-6 text-sm font-medium text-rose-500 hover:text-rose-700"
          type="button"
          @click="handleDelete"
        >
          Delete todo
        </button>
      </div>
    </div>
  </section>
</template>
