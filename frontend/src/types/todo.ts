export interface Todo {
  id: string
  title: string
  note?: string
  completed: boolean
  dueDate?: string | null
  createdAt: string
  updatedAt: string
}

export interface TodoInput {
  title: string
  note?: string
  dueDate?: string | null
}

export interface TodoUpdate extends TodoInput {
  completed: boolean
}

export type TodoPatch = Partial<TodoUpdate>

export type TodoStatusFilter = 'all' | 'active' | 'completed'
