const { v4: uuid } = require('uuid');

function createTodo(payload) {
  const timestamp = new Date().toISOString();
  return {
    id: uuid(),
    title: payload.title,
    note: payload.note ?? '',
    completed: false,
    dueDate: payload.dueDate ?? null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function replaceTodo(existing, payload) {
  return {
    ...existing,
    title: payload.title,
    note: payload.note ?? '',
    completed: payload.completed,
    dueDate: payload.dueDate ?? null,
    updatedAt: new Date().toISOString(),
  };
}

function mergeTodo(existing, payload) {
  const next = { ...existing };

  if (payload.title !== undefined) {
    next.title = payload.title;
  }
  if (payload.note !== undefined) {
    next.note = payload.note;
  }
  if (payload.completed !== undefined) {
    next.completed = payload.completed;
  }
  if (payload.dueDate !== undefined) {
    next.dueDate = payload.dueDate;
  }

  next.updatedAt = new Date().toISOString();
  return next;
}

module.exports = { createTodo, replaceTodo, mergeTodo };
