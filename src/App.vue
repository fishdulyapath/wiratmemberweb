<template>
  <div class="min-h-screen bg-navy-50">
    <!-- Top navbar -->
    <nav v-if="auth.isLoggedIn" class="bg-white border-b border-navy-100 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <router-link to="/" class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-sm">
              <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <span class="font-display font-semibold text-lg text-navy-800 hidden sm:block">Wirat Member</span>
          </router-link>

          <!-- Desktop nav links -->
          <div class="hidden md:flex items-center gap-1">
            <router-link v-for="item in navItems" :key="item.path" :to="item.path"
              class="px-3.5 py-2 rounded-lg text-sm font-medium transition-colors"
              :class="$route.path === item.path ? 'bg-brand-50 text-brand-700' : 'text-navy-500 hover:text-navy-700 hover:bg-navy-50'">
              {{ item.label }}
            </router-link>
          </div>

          <!-- User info + logout -->
          <div class="flex items-center gap-3">
            <div class="text-right hidden sm:block">
              <p class="text-sm font-medium text-navy-700">{{ auth.user?.display_name }}</p>
              <p class="text-xs text-navy-400">{{ auth.isStaff ? 'พนักงาน' : 'สมาชิก' }}</p>
            </div>
            <button @click="logout" class="p-2 rounded-lg text-navy-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="ออกจากระบบ">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-6">
      <router-view />
    </main>

    <!-- Mobile bottom nav -->
    <nav v-if="auth.isLoggedIn" class="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-navy-100 z-40 safe-bottom">
      <div class="flex justify-around items-center h-16">
        <router-link v-for="item in mobileNavItems" :key="item.path" :to="item.path"
          class="flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-lg transition-colors min-w-[60px]"
          :class="$route.path === item.path ? 'text-brand-600' : 'text-navy-400'">
          <component :is="item.icon" class="w-5 h-5" />
          <span class="text-[10px] font-medium">{{ item.label }}</span>
        </router-link>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { computed, h, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';

const router = useRouter();
const auth = useAuthStore();

onMounted(() => {
  if (auth.isLoggedIn) {
    auth.fetchMe();
  }
});

// SVG icon components
const IconHome = (_, { attrs }) => h('svg', { ...attrs, fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '2' },
  [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' })]);

const IconCart = (_, { attrs }) => h('svg', { ...attrs, fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '2' },
  [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z' })]);

const IconReturn = (_, { attrs }) => h('svg', { ...attrs, fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '2' },
  [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6' })]);

const IconStar = (_, { attrs }) => h('svg', { ...attrs, fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '2' },
  [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' })]);

const IconUsers = (_, { attrs }) => h('svg', { ...attrs, fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '2' },
  [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' })]);

const memberNav = [
  { path: '/', label: 'หน้าหลัก', icon: IconHome },
  { path: '/sales', label: 'ประวัติซื้อ', icon: IconCart },
  { path: '/returns', label: 'ประวัติคืน', icon: IconReturn },
  { path: '/points', label: 'แต้มสะสม', icon: IconStar },
];

const IconCalendar = (_, { attrs }) => h('svg', { ...attrs, fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '2' },
  [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' })]);

const staffNav = [
  { path: '/', label: 'หน้าหลัก', icon: IconHome },
  { path: '/staff/customers', label: 'ค้นหาสมาชิก', icon: IconUsers },
  { path: '/staff/add-points', label: 'เพิ่มแต้ม', icon: IconStar },
  { path: '/staff/use-points', label: 'ใช้แต้ม', icon: IconCart },
  { path: '/staff/cancel-use', label: 'ยกเลิกใช้แต้ม', icon: IconReturn },
  { path: '/staff/point-period', label: 'ช่วงวันที่ให้แต้ม', icon: IconCalendar },
];

const navItems = computed(() => auth.isStaff ? staffNav : memberNav);
const mobileNavItems = computed(() => {
  const items = auth.isStaff ? staffNav : memberNav;
  return items.slice(0, 5); // max 5 for mobile
});

function logout() {
  auth.logout();
  router.push('/login');
}
</script>

<style>
.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
