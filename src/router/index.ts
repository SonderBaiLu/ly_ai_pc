import {createRouter, createWebHistory, RouteRecordRaw} from 'vue-router'
import {useUserStore} from "@/stores/user.ts";

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
        meta: {loginRequired: true}
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
        meta: {requiresAdmin: true}
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior() {
        return {top: 0}
    },
})
// 全局路由守卫
router.beforeEach((to, _from, next) => {
    const userStore = useUserStore()
    const userInfo = userStore.userInfo || {}
    // 后端传过来的有时候 是字符出 有时候是 boolean 这样防止报错
    const isAdmin = userInfo.mainAdmin === 'true' || userInfo.mainAdmin === true
    const isMainAccount = userInfo.mainAccount === 'true' || userInfo.mainAccount === true
    // 会员管理页面：未登录拦截
    if (to.meta.loginRequired) {
        const token = userStore.token
        if (!token) {
            next('/') // 无权限，踢回首页
            ElMessage.error("请先登录!")
            return
        }
    }

    // 团队管理页面：非主账号/非管理员拦截
    if (to.meta.requiresAdmin && !(isAdmin || isMainAccount)) {
        next('/') // 无权限，踢回首页
        ElMessage.error("您无访问权限!")
        return
    }

    next() // 其余情况放行（保证只调用一次）
});
export default router
