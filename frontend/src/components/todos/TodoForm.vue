<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { fromDatetimeLocalValue, toDatetimeLocalValue } from '../../utils/date'

interface TodoFormState {
  title: string
  note?: string
  dueDate?: string | null
}

const props = withDefaults(
  defineProps<{
    initial?: TodoFormState
    submitLabel?: string
    busy?: boolean
  }>(),
  {
    submitLabel: 'Save',
    busy: false,
  }
)

const emit = defineEmits<{
  submit: [payload: TodoFormState]
}>()

const form = reactive<TodoFormState>({
  title: props.initial?.title ?? '',
  note: props.initial?.note ?? '',
  dueDate: toDatetimeLocalValue(props.initial?.dueDate),
})

watch(
  () => props.initial,
  (next) => {
    form.title = next?.title ?? ''
    form.note = next?.note ?? ''
    form.dueDate = toDatetimeLocalValue(next?.dueDate)
  },
  { deep: true },
)

const canSubmit = computed(() => form.title.trim().length > 0 && !props.busy)

function onSubmit() {
  if (!canSubmit.value) {
    return
  }
  const dueDate = fromDatetimeLocalValue(form.dueDate)
  emit('submit', {
    title: form.title.trim(),
    note: form.note?.trim() || undefined,
    dueDate,
  })
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="onSubmit">
    <div class="space-y-2">
      <label class="text-sm font-medium text-slate-600" for="title">Title</label>
      <input
        id="title"
        v-model="form.title"
        type="text"
        class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
        placeholder="Add new task"
        required
      />
    </div>
    <div class="space-y-2">
      <label class="text-sm font-medium text-slate-600" for="note">Notes</label>
      <textarea
        id="note"
        v-model="form.note"
        class="min-h-[100px] w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
        placeholder="Context, acceptance criteria, etc."
      />
    </div>
    <div class="space-y-2">
      <label class="text-sm font-medium text-slate-600" for="due">Due date</label>
      <input
        id="due"
        v-model="form.dueDate"
        type="datetime-local"
        class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
      />
    </div>
    <button
      type="submit"
      :disabled="!canSubmit"
      class="inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
    >
      <span v-if="busy" class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
      {{ submitLabel }}
    </button>
  </form>
</template>
