import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
  },
  {
    path: '/ai-design',
    name: 'AiDesign',
    component: () => import('../views/AiDesign.vue'),
  },
  {
    path: '/ai-fashion',
    name: 'AiFashionStudio',
    component: () => import('../views/AiFashionStudio/index.vue'),
  },
  {
    path: '/my-creations',
    name: 'MyCreations',
    component: () => import('../views/MyCreations.vue'),
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
