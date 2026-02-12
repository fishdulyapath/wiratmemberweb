<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-navy-50 relative overflow-hidden">
    <!-- Background Abstract Shapes -->
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-brand-100/40 rounded-full blur-3xl -translate-y-1/2 pointer-events-none"></div>
    <div class="absolute bottom-0 right-0 w-[500px] h-[500px] bg-navy-100/40 rounded-full blur-3xl translate-y-1/3 pointer-events-none"></div>

    <div class="relative w-full max-w-[400px]">
      
      <!-- Card -->
      <div class="bg-white/80 backdrop-blur-lg rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white p-8 sm:p-10">
        
        <!-- Header -->
        <div class="text-center mb-10">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-500 text-white mb-6 shadow-lg shadow-brand-500/20">
             <!-- Logo Icon -->
             <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
             </svg>
          </div>
          <h1 class="font-display text-2xl font-bold text-navy-900 tracking-tight">ยินดีต้อนรับ</h1>
          <p class="text-navy-400 text-sm mt-2">เข้าสู่ระบบสะสมแต้ม Wirat Member</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-navy-500 uppercase tracking-wider mb-2 ml-1">ชื่อผู้ใช้</label>
              <input 
                v-model="username" 
                type="text" 
                class="w-full px-5 py-3 rounded-xl bg-navy-50/50 border border-navy-100 text-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-navy-300" 
                placeholder="ระบุชื่อผู้ใช้ของคุณ" 
                autocomplete="username" 
                required
              >
            </div>
            <div>
              <div class="flex items-center justify-between mb-2 ml-1">
                <label class="block text-xs font-semibold text-navy-500 uppercase tracking-wider">รหัสผ่าน</label>
              </div>
              <input 
                v-model="password" 
                type="password" 
                class="w-full px-5 py-3 rounded-xl bg-navy-50/50 border border-navy-100 text-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-navy-300" 
                placeholder="ระบุรหัสผ่านของคุณ" 
                autocomplete="current-password" 
                required
              >
            </div>
          </div>

          <div v-if="error" class="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
             <svg class="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
            <p class="text-sm text-red-600 font-medium">{{ error }}</p>
          </div>

          <button 
            type="submit" 
            :disabled="loading" 
            class="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold shadow-lg shadow-brand-500/30 hover:shadow-brand-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
          >
            <div class="flex items-center justify-center gap-2">
              <svg v-if="loading" class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <span>{{ loading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ' }}</span>
            </div>
          </button>
        </form>
      </div>
      
      <p class="text-center mt-8 text-xs text-navy-400 font-medium">
        © 2026 Wirat Member System. All rights reserved.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const auth = useAuthStore();

const username = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

async function handleLogin() {
  error.value = '';
  loading.value = true;
  try {
    await auth.login(username.value, password.value);
    router.push('/');
  } catch (err) {
    if (err.response && err.response.data && err.response.data.error) {
      error.value = err.response.data.error;
    } else if (err.response && err.response.status === 401) {
      error.value = "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง";
    } else {
      error.value = 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
    }
    console.error(err);
  } finally {
    loading.value = false;
  }
}
</script>
