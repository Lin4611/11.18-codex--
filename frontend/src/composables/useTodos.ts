import { computed, ref } from 'vue'
import type { Todo, TodoInput, TodoPatch, TodoStatusFilter, TodoUpdate } from '../types/todo'

const API_BASE = (import.meta.env.VITE_API_BASE ?? '').replace(/\/$/, '')
const TODOS_ENDPOINT = `${API_BASE}/api/todos`.replace(/^\/\//, '/')

function buildUrl(path = '', query?: Record<string, string | undefined>) {
  let url = `${TODOS_ENDPOINT}${path ? `/${path}` : ''}`
  if (query) {
    const params = new URLSearchParams()
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.set(key, value)
      }
    })
    const qs = params.toString()
    if (qs) {
      url = `${url}?${qs}`
    }
  }
  return url
}

const items = ref<Todo[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const filter = ref<TodoStatusFilter>('all')

const completedCount = computed(() => items.value.filter((todo) => todo.completed).length)
const activeCount = computed(() => items.value.length - completedCount.value)

  async function request<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
    const res = await fetch(input, {
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
      ...init,
    })
    if (!res.ok) {
      const message = `Request failed with ${res.status}`
      throw new Error(message)
    }
    if (res.status === 204) {
      return undefined as T
    }
    return (await res.json()) as T
  }

  async function fetchTodos(nextFilter?: TodoStatusFilter) {
    loading.value = true
    error.value = null
    if (nextFilter) {
      filter.value = nextFilter
    }
    try {
      const statusQuery =
        filter.value === 'all' ? undefined : (filter.value as 'active' | 'completed')
      const data = await request<Todo[]>(buildUrl('', { status: statusQuery }))
      items.value = data
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Unable to load todos. Please try again later.'
    } finally {
      loading.value = false
    }
  }

  async function createTodo(input: TodoInput) {
    const created = await request<Todo>(buildUrl(), {
      method: 'POST',
      body: JSON.stringify(input),
    })
    items.value = [created, ...items.value]
    return created
  }

  async function replaceTodo(id: string, body: TodoUpdate) {
    const updated = await request<Todo>(buildUrl(id), {
      method: 'PUT',
      body: JSON.stringify(body),
    })
    items.value = items.value.map((todo) => (todo.id === id ? updated : todo))
    return updated
  }

  async function patchTodo(id: string, body: TodoPatch) {
    const updated = await request<Todo>(buildUrl(id), {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
    items.value = items.value.map((todo) => (todo.id === id ? updated : todo))
    return updated
  }

  async function deleteTodo(id: string) {
    await request<void>(buildUrl(id), {
      method: 'DELETE',
    })
    items.value = items.value.filter((todo) => todo.id !== id)
  }

  async function getTodo(id: string) {
    return request<Todo>(buildUrl(id))
  }

export function useTodos() {
  return {
    items,
    loading,
    error,
    filter,
    activeCount,
    completedCount,
    fetchTodos,
    createTodo,
    replaceTodo,
    patchTodo,
    deleteTodo,
    getTodo,
  }
}
