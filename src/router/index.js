import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { guest: true },
  },
  // Member routes
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/sales',
    name: 'Sales',
    component: () => import('../views/SalesView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/returns',
    name: 'Returns',
    component: () => import('../views/ReturnsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/points',
    name: 'Points',
    component: () => import('../views/PointsView.vue'),
    meta: { requiresAuth: true },
  },
  // Staff routes
  {
    path: '/staff/customers',
    name: 'StaffCustomers',
    component: () => import('../views/staff/CustomerSearchView.vue'),
    meta: { requiresAuth: true, staffOnly: true },
  },
  {
    path: '/staff/customer/:code',
    name: 'StaffCustomerDetail',
    component: () => import('../views/staff/CustomerDetailView.vue'),
    meta: { requiresAuth: true, staffOnly: true },
  },
  {
    path: '/staff/add-points',
    name: 'StaffAddPoints',
    component: () => import('../views/staff/AddPointsView.vue'),
    meta: { requiresAuth: true, staffOnly: true },
  },
  {
    path: '/staff/use-points',
    name: 'StaffUsePoints',
    component: () => import('../views/staff/UsePointsView.vue'),
    meta: { requiresAuth: true, staffOnly: true },
  },
  {
    path: '/staff/cancel-use',
    name: 'StaffCancelUse',
    component: () => import('../views/staff/CancelUseView.vue'),
    meta: { requiresAuth: true, staffOnly: true },
  },
  {
    path: '/staff/point-period',
    name: 'StaffPointPeriod',
    component: () => import('../views/staff/PointPeriodConfigView.vue'),
    meta: { requiresAuth: true, staffOnly: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const auth = useAuthStore();

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return next('/login');
  }
  if (to.meta.guest && auth.isLoggedIn) {
    return next('/');
  }
  if (to.meta.staffOnly && !auth.isStaff) {
    return next('/');
  }
  next();
});

export default router;
