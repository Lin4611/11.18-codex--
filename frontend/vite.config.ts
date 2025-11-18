import { randomUUID } from 'node:crypto'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import type { PluginOption, PreviewServer, ViteDevServer } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import type { Todo, TodoInput, TodoPatch, TodoStatusFilter, TodoUpdate } from './src/types/todo'

type MiddlewareNext = (err?: unknown) => void
type MiddlewareHandler = (
  req: IncomingMessage,
  res: ServerResponse,
  next: MiddlewareNext,
) => void | Promise<void>

function todoApiMock(): PluginOption {
  const middleware = createTodoMiddleware()
  return {
    name: 'todo-api-mock',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(middleware)
    },
    configurePreviewServer(server: PreviewServer) {
      server.middlewares.use(middleware)
    },
  }
}

function createTodoMiddleware(): MiddlewareHandler {
  const todos = seedTodos()

  return async (req, res, next) => {
    if (!req.url || !req.method) {
      next()
      return
    }
    if (!req.url.startsWith('/api/todos')) {
      next()
      return
    }

    const url = new URL(req.url, 'http://localhost')
    const pathname = url.pathname
    const idMatch = pathname.match(/^\/api\/todos\/([^/]+)$/)
    const sendJson = (status: number, payload?: unknown) => {
      res.statusCode = status
      res.setHeader('Content-Type', 'application/json')
      res.end(payload === undefined ? '' : JSON.stringify(payload))
    }

    try {
      if (pathname === '/api/todos') {
        await handleCollection(req.method, url.searchParams, req, sendJson, todos)
        return
      }

      if (idMatch) {
        const todoId = decodeURIComponent(idMatch[1])
        await handleSingle(req.method, todoId, req, sendJson, todos)
        return
      }

      sendJson(404, { message: 'Not found' })
    } catch (error) {
      console.error('[todo-api]', error)
      sendJson(500, { message: 'Internal server error' })
    }
  }
}

async function handleCollection(
  method: string,
  params: URLSearchParams,
  req: IncomingMessage,
  sendJson: (status: number, payload?: unknown) => void,
  todos: Todo[],
) {
  if (method === 'GET') {
    const status = params.get('status') as TodoStatusFilter | null
    const filtered = todos.filter((todo) => filterTodo(todo, status ?? 'all'))
    sendJson(200, filtered)
    return
  }

  if (method === 'POST') {
    const body = (await parseBody(req)) as Partial<TodoInput>
    if (!body?.title) {
      sendJson(400, { message: 'Title is required' })
      return
    }
    const now = new Date().toISOString()
    const todo: Todo = {
      id: randomUUID(),
      title: body.title,
      note: body.note ?? '',
      completed: false,
      dueDate: normalizeDueDate(body.dueDate),
      createdAt: now,
      updatedAt: now,
    }
    todos.unshift(todo)
    sendJson(201, todo)
    return
  }

  sendJson(405, { message: 'Method Not Allowed' })
}

async function handleSingle(
  method: string,
  todoId: string,
  req: IncomingMessage,
  sendJson: (status: number, payload?: unknown) => void,
  todos: Todo[],
) {
  const index = todos.findIndex((todo) => todo.id === todoId)
  if (index === -1) {
    sendJson(404, { message: 'Todo not found' })
    return
  }

  const current = todos[index]

  if (method === 'GET') {
    sendJson(200, current)
    return
  }

  if (method === 'DELETE') {
    todos.splice(index, 1)
    sendJson(204)
    return
  }

  if (method === 'PUT') {
    const body = (await parseBody(req)) as Partial<TodoUpdate>
    if (!body?.title || typeof body.completed !== 'boolean') {
      sendJson(400, { message: 'Title and completed status are required' })
      return
    }
    const now = new Date().toISOString()
    const updated: Todo = {
      ...current,
      title: body.title,
      note: body.note ?? '',
      completed: body.completed,
      dueDate: normalizeDueDate(body.dueDate),
      updatedAt: now,
    }
    todos[index] = updated
    sendJson(200, updated)
    return
  }

  if (method === 'PATCH') {
    const body = (await parseBody(req)) as TodoPatch
    const now = new Date().toISOString()
    const updated: Todo = {
      ...current,
      title: body.title ?? current.title,
      note: body.note ?? current.note,
      completed: typeof body.completed === 'boolean' ? body.completed : current.completed,
      dueDate: body.dueDate !== undefined ? normalizeDueDate(body.dueDate) : current.dueDate ?? null,
      updatedAt: now,
    }
    todos[index] = updated
    sendJson(200, updated)
    return
  }

  sendJson(405, { message: 'Method Not Allowed' })
}

async function parseBody(req: IncomingMessage) {
  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  if (!chunks.length) return {}
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    return {}
  }
}

function normalizeDueDate(value: unknown) {
  if (typeof value === 'string' && value.trim()) {
    return value
  }
  return null
}

function filterTodo(todo: Todo, status: TodoStatusFilter) {
  if (status === 'active') return !todo.completed
  if (status === 'completed') return todo.completed
  return true
}

function seedTodos(): Todo[] {
  const now = Date.now()
  const sample = [
    {
      title: 'Plan sprint demo',
      note: 'Gather screenshots and notes',
      completed: false,
      offsetDays: 2,
    },
    {
      title: 'Write API docs',
      note: 'Update `/api/todos` response samples',
      completed: false,
      offsetDays: 5,
    },
    {
      title: 'Verify production deploy',
      note: 'Smoke test flows',
      completed: true,
      offsetDays: -1,
    },
  ]

  return sample.map((item) => {
    const timestamp = new Date(now + item.offsetDays * 24 * 60 * 60 * 1000)
    const iso = timestamp.toISOString()
    return {
      id: randomUUID(),
      title: item.title,
      note: item.note,
      completed: item.completed,
      dueDate: iso,
      createdAt: iso,
      updatedAt: iso,
    } satisfies Todo
  })
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
    todoApiMock(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
