# TODO 清單 API 系統設計計畫（SDD）

## 1. 系統概覽
建立一個基於 Express 的待辦事項（TODO）REST API，支援新增、查詢、更新、刪除。資料暫存於記憶體，重啟即重置。專案需提供 OpenAPI 3.0 規格文件並包含自動產生腳本，主要程式碼放在 `src/` 之下。

## 2. 使用技術
- Node.js 18+、Express 4：處理 HTTP 與路由。
- `express-validator`：驗證輸入欄位。
- `swagger-jsdoc` + `swagger-ui-express`：產生與提供 OpenAPI 規格。
- `uuid`：建立唯一待辦 ID。
- Jest（預留）：驗證 service/路由邏輯。

## 3. 專案結構
```
src/
  app.js              # 建立 Express app，掛載路由與 OpenAPI
  server.js           # 啟動伺服器（對應 npm start）
  routes/
    todos.routes.js   # 定義 CRUD API
  controllers/
    todos.controller.js
  services/
    todos.service.js  # in-memory 資料處理
  models/
    todo.model.js     # Type 定義與工廠
  middleware/
    validations.js    # 驗證與錯誤格式化
  openapi/
    swagger.js        # swagger-jsdoc 設定
    generator.js      # 指令：輸出 JSON 於 docs/openapi.json
docs/
  todo-plan-codex-1.md
  openapi.json (生成)
```

## 4. 路由（API 端點）
| Method | Path | 描述 | Request Body | Response |
| --- | --- | --- | --- | --- |
| GET | `/api/todos` | 取得全部待辦（可加 `status` query） | - | `[{ id, title, completed, dueDate, note }]` |
| GET | `/api/todos/:id` | 取得特定待辦 | - | `{ ... }` |
| POST | `/api/todos` | 建立待辦 | `{ title, dueDate?, note? }` | 201 + 新物件 |
| PUT | `/api/todos/:id` | 全量更新 | `{ title, completed, dueDate?, note? }` | 更新後物件 |
| PATCH | `/api/todos/:id` | 局部更新 | 任意欄位 | 更新後物件 |
| DELETE | `/api/todos/:id` | 刪除 | - | 204 無內容 |

## 5. 資料結構
```ts
type Todo = {
  id: string;           // uuid
  title: string;        // 必填
  note?: string;
  completed: boolean;
  dueDate?: string;     // ISO 日期
  createdAt: string;
  updatedAt: string;
};
```
儲存方式：`const store = new Map<string, Todo>();`；service 層封裝 CRUD 與篩選邏輯。

## 6. OpenAPI 產生策略
- `src/openapi/swagger.js`：使用 `swagger-jsdoc`，蒐集 `src/routes/**/*.js` 的 JSDoc。
- `npm run openapi:build` 觸發 `node src/openapi/generator.js`，寫出 `docs/openapi.json`。
- `app.js` 使用 `swagger-ui-express` 於 `/docs` 提供 UI。

## 7. 程式碼範例
```js
// src/services/todos.service.js
const { v4: uuid } = require('uuid');
const store = new Map();

function createTodo(payload) {
  const now = new Date().toISOString();
  const todo = {
    id: uuid(),
    title: payload.title,
    note: payload.note ?? '',
    completed: false,
    dueDate: payload.dueDate,
    createdAt: now,
    updatedAt: now,
  };
  store.set(todo.id, todo);
  return todo;
}

module.exports = { createTodo /* ...其他 CRUD... */ };
```
```js
// src/routes/todos.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/todos.controller');
router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.get('/:id', ctrl.get);
router.patch('/:id', ctrl.patch);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);
module.exports = router;
```
```js
// src/openapi/generator.js
const fs = require('fs');
const path = require('path');
const spec = require('./swagger');
fs.writeFileSync(path.join(__dirname, '../../docs/openapi.json'), JSON.stringify(spec, null, 2));
console.log('OpenAPI spec generated at docs/openapi.json');
```

## 8. 運作流程
1. `server.js` 讀取環境變數後啟動 Express。
2. `app.js` 註冊 JSON parsing、驗證錯誤處理、`/api/todos` 路由與 `/docs` Swagger UI。
3. Request 進入 `routes/todos.routes.js`，依 HTTP 方法轉至 controller。
4. Controller 調用 `todos.service` 完成 CRUD，並處理錯誤（例如找不到項目）。
5. Service 操作 `Map` 儲存資料、設定 `updatedAt`。
6. 回傳 JSON，並在必要時觸發適當的 HTTP 狀態碼（201、204、404）。

## 9. 開發順序
1. 初始化 `src/` 結構與 `npm` scripts：`start`, `openapi:build`, `dev`（nodemon 選配）。
2. 建立 `app.js`, `server.js`，確保 Express 可啟動。
3. 實作 `todos.service.js`，並撰寫單元測試確保 CRUD 正確。
4. 實作 controller + 路由，加入 `express-validator` 驗證與錯誤處理。
5. 撰寫 JSDoc 注解以描述 OpenAPI，完成 Swagger generator 與 `/docs` UI。
6. 執行 `npm run openapi:build` 產出 `docs/openapi.json`，確認規格正確。
7. （選配）加入 Jest 測試腳本與 CI 片段。
8. 文件化 README/使用說明、提交 PR。
