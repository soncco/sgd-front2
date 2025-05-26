import { createRouter, createWebHistory } from 'vue-router'
import routes from './routes'
import { useAuthStore } from 'src/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  if (!authStore.isAuthenticated && localStorage.getItem('access_token')) {
    await authStore.initialize()
  }
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router
