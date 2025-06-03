const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'oficinas', component: () => import('pages/sistema/OficinasPage.vue') },
      { path: 'tipos-documento', component: () => import('pages/sistema/TiposDocumentoPage.vue') },
      { path: 'acciones', component: () => import('pages/sistema/AccionesPage.vue') },
    ],
    meta: { requiresAuth: true },
  },
  {
    path: '/login',
    component: () => import('layouts/AuthLayout.vue'),
    children: [{ path: '', component: () => import('pages/LoginPage.vue') }],
  },
  {
    path: '/test',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/Test.vue'),
      }
    ]
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/ErrorNotFound.vue') }],
  },
]

export default routes
