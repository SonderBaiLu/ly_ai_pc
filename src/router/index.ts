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
    path: '/creative-detail/:id',
    name: 'CreativeDetail',
    component: () => import('../views/CreativeDetail.vue'),
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue'),
  },
  {
    path: '/agreement',
    name: 'Agreement',
    component: () => import('../views/Agreement.vue'),
  },
  {
    path: '/membership',
    name: 'Membership',
    component: () => import('../views/Membership.vue'),
  },
  {
    path: '/invitation-gift',
    name: 'InvitationGift',
    component: () => import('../views/InvitationGift.vue'),
  },
  {
    path: '/activity-rules',
    name: 'ActivityRules',
    component: () => import('../views/ActivityRules.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
  },
  {
    path: '/team-management',
    name: 'TeamManagement',
    component: () => import('../views/TeamManagement.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/team-management',
    name: 'TeamManagement',
    component: () => import('../views/TeamManagement.vue'),
    meta: { requiresAuth: true }
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
