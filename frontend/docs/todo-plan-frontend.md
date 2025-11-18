# TODO Frontend Development Plan

## 1. Goal & Scope
- Build a responsive Vue 3 single-page app that consumes the TODO API described in `docs/openapi.json`.
- Provide CRUD interactions for todos, filter by status (`all`, `active`, `completed`), and surface metadata (notes, due date).
- Deliver production-ready build via Vite with type safety through TypeScript and Vue Router-based navigation.

## 2. Technology Stack
- **Framework**: Vue 3 with `<script setup>` SFCs, Composition API, and Vue Router for client-side navigation.
- **Styling**: Tailwind CSS (already configured) plus component-scoped classes for dynamic states.
- **State Management**: Local composables for view state; introduce Pinia only if cross-view coordination becomes complex.
- **HTTP**: Native `fetch` with typed helpers or `useTodoService` composable to centralize headers and error handling.
- **Tooling**: Vite for dev/build, `vue-tsc` for type checks, Vitest (future) for unit coverage.

## 3. Project Structure
```
src/
 ├─ main.ts               # App bootstrap, router + global styles
 ├─ router/
 │   └─ index.ts          # Route configs for list, detail, editor
 ├─ components/
 │   ├─ todos/
 │   │   ├─ TodoList.vue
 │   │   ├─ TodoItem.vue
 │   │   └─ TodoForm.vue
 │   └─ ui/
 │       └─ Button.vue    # Shared UI atoms
 ├─ views/
 │   ├─ TodoBoardView.vue # List + stats
 │   └─ TodoDetailView.vue# Inspect/edit single todo
 ├─ composables/
 │   └─ useTodos.ts       # Encapsulate fetch + state caching
 └─ styles/main.css
```
Tests (later) will mirror view/component folders under `__tests__`.

## 4. API Routes & Contracts
| Endpoint | Method | Query/Body | Success | Notes |
| --- | --- | --- | --- | --- |
| `/api/todos` | GET | `status` (active/completed) optional | `200 Todo[]` | Use for main list; missing filter = all |
| `/api/todos` | POST | `TodoInput` {title, note?, dueDate?} | `201 Todo` | Provide optimistic add |
| `/api/todos/{id}` | GET | path `id` | `200 Todo` / `404` | Populate detail page |
| `/api/todos/{id}` | PUT | `TodoUpdate` incl. `completed` | `200` / `404` | Full edit form submit |
| `/api/todos/{id}` | PATCH | `TodoPatch` fields subset | `200` / `404` | Toggle completion, inline edits |
| `/api/todos/{id}` | DELETE | path `id` | `204` / `404` | Confirm before delete |
Adhere to ISO date strings for `dueDate`, `createdAt`, `updatedAt`.

## 5. UI Modules & Navigation
- **TodoBoardView** (`/`): shows toolbar (filters, stats, “Add Todo”), list component, empty-state card.
- **TodoDetailView** (`/todos/:id`): card with title, note, due date, completion toggle, and delete CTA.
- **Modal or Drawer** for creating/updating, reusing `TodoForm.vue`.
- Router guards ensure invalid `:id` redirects back to board with toast error.

## 6. Data & Interaction Flow
1. `main.ts` mounts app, injects router, registers error boundary handler.
2. `useTodos()` loads todos on mount via `GET /api/todos`, caches array in `ref`.
3. Filter chips trigger service call with `status` query; UI shows skeleton loaders.
4. Creating a todo:
   - `TodoForm` emits validated payload to service `createTodo`.
   - On success, append new todo locally and optionally refetch for accuracy.
5. Updating:
   - Inline completion toggles send `PATCH` with `{ completed }`.
   - Full edits submit `PUT`, update item in cache via `map`.
6. Deleting triggers confirmation modal, then `DELETE`; success removes from cache and shows toast.
7. Errors propagate to composable; UI shows non-blocking alert bars.

## 7. Sample Implementation Snippet
```ts
// src/composables/useTodos.ts
import { ref } from 'vue';

const API_BASE = '/api/todos';

export function useTodos() {
  const items = ref<Todo[]>([]);
  const loading = ref(false);

  async function fetchTodos(status?: 'active' | 'completed') {
    loading.value = true;
    const qs = status ? `?status=${status}` : '';
    const res = await fetch(`${API_BASE}${qs}`);
    if (!res.ok) throw new Error('Failed to load todos');
    items.value = await res.json();
    loading.value = false;
  }

  async function toggleComplete(id: string, completed: boolean) {
    await fetch(`${API_BASE}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    });
    await fetchTodos();
  }

  return { items, loading, fetchTodos, toggleComplete };
}
```

## 8. Operational Considerations
- Surface relative times (“Due in 3 days”) via utility computed from ISO dates.
- Enforce form validation: title required, optional due date must be future.
- Accessibility: keyboard focus outlines on filter chips and form controls.
- Store backend URL in `VITE_API_BASE` to point to non-local environments.

## 9. Development Sequence
1. **Scaffold Routing & Layout**: Configure routes, base layout, nav skeleton; ensure Tailwind utilities cover base typography.
2. **Implement Todo Service**: `useTodos` composable with typed DTOs; include error boundary handling and loading signals.
3. **TodoBoardView + List Components**: Load data, render list, empty state, filter chips wired to service calls.
4. **Creation Flow**: Build `TodoForm`, modal presentation, POST integration with optimistic UI.
5. **Detail + Edit Flow**: `TodoDetailView`, editing form reuse, PUT/PATCH interactions, route guard for 404.
6. **Deletion & Toast Feedback**: Confirmation dialog, cascade updates, reusable toast component.
7. **Polish & Testing**: Add type tests (vue-tsc), smoke run via `npm run dev`, plan Vitest specs for service + components.
