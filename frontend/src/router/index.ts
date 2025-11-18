import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'todo-board',
      component: () => import('../views/TodoBoardView.vue'),
    },
    {
      path: '/todos/:id',
      name: 'todo-detail',
      component: () => import('../views/TodoDetailView.vue'),
      props: true,
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

export default router
