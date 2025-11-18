<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import TodoFilters from '../components/todos/TodoFilters.vue'
import TodoForm from '../components/todos/TodoForm.vue'
import TodoList from '../components/todos/TodoList.vue'
import TodoEmptyState from '../components/todos/TodoEmptyState.vue'
import { useTodos } from '../composables/useTodos'
import type { TodoStatusFilter } from '../types/todo'

const router = useRouter()
const {
  items,
  loading,
  error,
  filter,
  activeCount,
  completedCount,
  fetchTodos,
  createTodo,
  patchTodo,
  deleteTodo,
} = useTodos()

const showForm = ref(true)
const saving = ref(false)

const counts = computed(() => ({
  all: items.value.length,
  active: activeCount.value,
  completed: completedCount.value,
}))

onMounted(() => {
  fetchTodos()
})

async function handleCreate(payload: { title: string; note?: string; dueDate?: string | null }) {
  try {
    saving.value = true
    await createTodo(payload)
    await fetchTodos(filter.value)
    showForm.value = false
  } finally {
    saving.value = false
  }
}

async function handleToggle(id: string, completed: boolean) {
  await patchTodo(id, { completed })
}

async function handleDelete(id: string) {
  const confirmed = window.confirm('Delete this todo?')
  if (!confirmed) return
  await deleteTodo(id)
}

function handleFilterChange(next: TodoStatusFilter) {
  if (next === filter.value) return
  fetchTodos(next)
}

function goToDetail(id: string) {
  router.push({ name: 'todo-detail', params: { id } })
}
</script>

<template>
  <section class="space-y-8">
    <div class="rounded-2xl border border-slate-200 bg-white/90 px-6 py-6 shadow-lg shadow-slate-900/5">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p class="text-xs uppercase tracking-wide text-slate-400">Overview</p>
          <p class="text-2xl font-semibold text-slate-900">{{ counts.active }} open tasks</p>
        </div>
        <TodoFilters :value="filter" :counts="counts" @change="handleFilterChange" />
      </div>
      <button
        class="mt-4 text-sm font-medium text-slate-600 hover:text-slate-900"
        @click="showForm = !showForm"
      >
        {{ showForm ? 'Hide form' : 'Add a new todo' }}
      </button>
      <div v-if="showForm" class="mt-6 border-t border-slate-100 pt-6">
        <TodoForm submit-label="Create todo" :busy="saving" @submit="handleCreate" />
      </div>
    </div>

    <div class="space-y-4">
      <p class="text-sm font-semibold text-slate-600">Todos</p>
      <div v-if="error" class="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">
        {{ error }}
      </div>
      <div v-if="loading" class="space-y-3">
        <div v-for="n in 3" :key="n" class="h-20 animate-pulse rounded-2xl bg-slate-200/60"></div>
      </div>
      <TodoEmptyState v-else-if="!items.length" />
      <TodoList
        v-else
        :todos="items"
        @toggle="handleToggle"
        @delete="handleDelete"
        @open="goToDetail"
      />
    </div>
  </section>
</template>
