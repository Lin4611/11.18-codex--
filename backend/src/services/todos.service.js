const { createTodo, replaceTodo, mergeTodo } = require('../models/todo.model');

const store = new Map();

function list({ status } = {}) {
  let todos = Array.from(store.values());

  if (status === 'completed') {
    todos = todos.filter((todo) => todo.completed);
  } else if (status === 'active') {
    todos = todos.filter((todo) => !todo.completed);
  }

  return todos;
}

function getById(id) {
  return store.get(id) || null;
}

function create(payload) {
  const todo = createTodo(payload);
  store.set(todo.id, todo);
  return todo;
}

function replace(id, payload) {
  const existing = getById(id);
  if (!existing) {
    return null;
  }
  const updated = replaceTodo(existing, payload);
  store.set(id, updated);
  return updated;
}

function patch(id, payload) {
  const existing = getById(id);
  if (!existing) {
    return null;
  }
  const updated = mergeTodo(existing, payload);
  store.set(id, updated);
  return updated;
}

function remove(id) {
  const existed = store.delete(id);
  return existed;
}

module.exports = {
  list,
  getById,
  create,
  replace,
  patch,
  remove,
};
