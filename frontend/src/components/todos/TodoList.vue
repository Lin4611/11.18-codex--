<script setup lang="ts">
import type { Todo } from '../../types/todo'
import TodoItem from './TodoItem.vue'

defineProps<{
  todos: Todo[]
}>()

const emit = defineEmits<{
  toggle: [id: string, completed: boolean]
  delete: [id: string]
  open: [id: string]
}>()
</script>

<template>
  <div class="space-y-3">
    <TodoItem
      v-for="todo in todos"
      :key="todo.id"
      :todo="todo"
      @toggle="(id, completed) => emit('toggle', id, completed)"
      @delete="(id) => emit('delete', id)"
      @open="(id) => emit('open', id)"
    />
  </div>
</template>
