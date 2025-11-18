const router = require('express').Router();
const { body, param, query } = require('express-validator');
const controller = require('../controllers/todos.controller');
const { handleValidationErrors } = require('../middleware/validations');

const todoIdValidator = [
  param('id').isUUID().withMessage('id must be a UUID'),
  handleValidationErrors,
];

const todoStatusValidator = [
  query('status')
    .optional()
    .isIn(['active', 'completed'])
    .withMessage('status must be active or completed'),
  handleValidationErrors,
];

const createValidators = [
  body('title').isString().trim().notEmpty().withMessage('title is required'),
  body('note').optional().isString().withMessage('note must be a string'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('dueDate must be an ISO 8601 string'),
  handleValidationErrors,
];

const replaceValidators = [
  body('title').isString().trim().notEmpty().withMessage('title is required'),
  body('completed').isBoolean().withMessage('completed must be boolean'),
  body('note').optional().isString(),
  body('dueDate').optional().isISO8601(),
  handleValidationErrors,
];

const patchValidators = [
  body().custom((value) => {
    if (!value || Object.keys(value).length === 0) {
      throw new Error('Request body cannot be empty');
    }
    return true;
  }),
  body('title').optional().isString().trim().notEmpty(),
  body('note').optional().isString(),
  body('completed').optional().isBoolean(),
  body('dueDate').optional().isISO8601(),
  handleValidationErrors,
];

/**
 * @swagger
 * components:
 *   schemas:
 *     Todo:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         note:
 *           type: string
 *         completed:
 *           type: boolean
 *         dueDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     TodoInput:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         title:
 *           type: string
 *         note:
 *           type: string
 *         dueDate:
 *           type: string
 *           format: date-time
 *     TodoUpdate:
 *       allOf:
 *         - $ref: '#/components/schemas/TodoInput'
 *       required:
 *         - completed
 *       properties:
 *         completed:
 *           type: boolean
 *     TodoPatch:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         note:
 *           type: string
 *         completed:
 *           type: boolean
 *         dueDate:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/todos:
 *   get:
 *     summary: List todos
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, completed]
 *         description: Filter by completion status
 *     responses:
 *       200:
 *         description: A list of todos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Todo'
 *   post:
 *     summary: Create a todo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TodoInput'
 *     responses:
 *       201:
 *         description: Created todo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 */
router.get('/', todoStatusValidator, controller.list);
router.post('/', createValidators, controller.create);

/**
 * @swagger
 * /api/todos/{id}:
 *   get:
 *     summary: Get a todo by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A todo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       404:
 *         description: Not found
 *   put:
 *     summary: Replace a todo
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TodoUpdate'
 *     responses:
 *       200:
 *         description: Updated todo
 *       404:
 *         description: Not found
 *   patch:
 *     summary: Update todo fields
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TodoPatch'
 *     responses:
 *       200:
 *         description: Updated todo
 *       404:
 *         description: Not found
 *   delete:
 *     summary: Delete a todo
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Deleted
 *       404:
 *         description: Not found
 */
router.get('/:id', todoIdValidator, controller.get);
router.put('/:id', [...todoIdValidator, ...replaceValidators], controller.update);
router.patch('/:id', [...todoIdValidator, ...patchValidators], controller.patch);
router.delete('/:id', todoIdValidator, controller.remove);

module.exports = router;
