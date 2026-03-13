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
// --------------下面全是测试路由 -------------------------------------------------------------------
    {
      path: '/bin',
      name: 'BindPhoneModal',
      component: () => import('@/components/BindPhoneModal.vue'),
    },
  {
    path: '/code',
    name: 'InvitationCodeModal',
    component: () => import('@/components/InvitationCode.vue'),
  },
  {
    path: '/reset',
    name: 'ResetPasswordModal',
    component: () => import('@/components/ResetPassword.vue'),
  },
// --------------上面全是测试路由 -------------------------------------------------------------------
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
