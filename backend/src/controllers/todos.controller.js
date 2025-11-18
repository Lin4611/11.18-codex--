const todoService = require('../services/todos.service');

function list(req, res) {
  const todos = todoService.list({ status: req.query.status });
  res.json(todos);
}

function get(req, res) {
  const todo = todoService.getById(req.params.id);
  if (!todo) {
    return res.status(404).json({ message: 'Todo not found' });
  }
  return res.json(todo);
}

function create(req, res) {
  const todo = todoService.create(req.body);
  return res.status(201).json(todo);
}

function update(req, res) {
  const todo = todoService.replace(req.params.id, req.body);
  if (!todo) {
    return res.status(404).json({ message: 'Todo not found' });
  }
  return res.json(todo);
}

function patch(req, res) {
  const todo = todoService.patch(req.params.id, req.body);
  if (!todo) {
    return res.status(404).json({ message: 'Todo not found' });
  }
  return res.json(todo);
}

function remove(req, res) {
  const removed = todoService.remove(req.params.id);
  if (!removed) {
    return res.status(404).json({ message: 'Todo not found' });
  }
  return res.status(204).send();
}

module.exports = { list, get, create, update, patch, remove };
