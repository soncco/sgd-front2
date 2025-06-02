const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/IndexPage.vue') }],
    meta: { requiresAuth: true },
  },
  {
    path: '/login',
    component: () => import('layouts/AuthLayout.vue'),
    children: [{ path: '', component: () => import('pages/LoginPage.vue') }],
  },

  // SISTEMA

  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'opciones',
        component: () => import('pages/sistema/OpcionPage.vue'),
        props: true,
        meta: { requireLogin: true, groups: ['Administradores'] },
      },
    ],
  },

  // TEST
  {
    path: '/test',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/Test.vue'),
      },
    ],
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/ErrorNotFound.vue') }],
  },
]

export default routes
