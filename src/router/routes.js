const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      /*
      { path: 'accion/nuevo', component: () => import('pages/sistema/NuevaAccion.vue') },
      {
        path: 'accion/editar/:id',
        component: () => import('pages/sistema/EditarAccion.vue'),
        props: true,
      },
      */
      // TRAMITES
      {
        path: 'tramite/nuevo',
        component: () => import('pages/tramite/NuevoDocumentoPage.vue'),
      },

      {
        path: 'accion/nuevo',
        component: () => import('pages/sistema/AccionForm.vue'),
      },
      {
        path: 'accion/editar/:id',
        component: () => import('pages/sistema/AccionForm.vue'),
        props: true,
      },
      { path: 'acciones', component: () => import('pages/sistema/AccionesPage.vue') },
      { path: 'oficina/nuevo', component: () => import('pages/sistema/NuevaOficina.vue') },
      {
        path: 'oficina/editar/:id',
        component: () => import('pages/sistema/EditarOficina.vue'),
        props: true,
      },
      { path: 'oficinas', component: () => import('pages/sistema/OficinasPage.vue') },
      {
        path: 'tipos-documento/nuevo',
        component: () => import('pages/sistema/NuevoTipoDocumento.vue'),
      },
      {
        path: 'tipos-documento/editar/:id',
        component: () => import('pages/sistema/EditarTipoDocumento.vue'),
        props: true,
      },
      {
        path: 'cargo/nuevo',
        component: () => import('pages/sistema/NuevoCargo.vue'),
      },
      {
        path: 'cargo/editar/:id',
        component: () => import('pages/sistema/EditarCargo.vue'),
        props: true,
      },
      { path: 'cargos', component: () => import('pages/sistema/CargosPage.vue') },
      { path: 'tipos-documento', component: () => import('pages/sistema/TiposDocumentoPage.vue') },
      { path: 'personas', component: () => import('pages/sistema/PersonasPage.vue') },
      { path: 'persona/nuevo', component: () => import('src/pages/sistema/PersonaForm.vue') },
      {
        path: 'persona/editar/:id',
        component: () => import('src/pages/sistema/PersonaForm.vue'),
        props: true,
      },
      {
        path: 'editarcontrasena',
        component: () => import('src/pages/EditarContraseña.vue'),
      },
      { path: 'editarusuario', component: () => import('src/pages/EditarUsuario.vue') },
      { path: 'bandeja/entrada', component: () => import('src/pages/tramite/BandejaEntrada.vue') },
      { path: 'bandeja/salida', component: () => import('src/pages/tramite/BandejaSalida.vue') },
    ],
    meta: { requiresAuth: true },
  },
  {
    path: '/login',
    component: () => import('layouts/AuthLayout.vue'),
    children: [{ path: '', component: () => import('pages/LoginPage.vue') }],
  },
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
