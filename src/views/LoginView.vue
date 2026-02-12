<template>
  <div class="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-navy-800 via-navy-900 to-navy-900">
    <!-- Background decoration -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -right-40 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-400/10 rounded-full blur-3xl"></div>
    </div>

    <div class="relative w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-xl shadow-brand-500/25 mb-4">
          <svg class="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </div>
        <h1 class="font-display text-3xl font-bold text-white">Wirat Member</h1>
        <p class="text-navy-300 mt-1 text-sm">ระบบสะสมแต้มสมาชิก</p>
      </div>

      <!-- Login card -->
      <div class="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8">
        <form @submit.prevent="handleLogin" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-navy-600 mb-1.5">ชื่อผู้ใช้</label>
            <input v-model="username" type="text" class="input-field" placeholder="กรอกชื่อผู้ใช้" autocomplete="username" required>
          </div>
          <div>
            <label class="block text-sm font-medium text-navy-600 mb-1.5">รหัสผ่าน</label>
            <input v-model="password" type="password" class="input-field" placeholder="กรอกรหัสผ่าน" autocomplete="current-password" required>
          </div>

          <div v-if="error" class="p-3 rounded-xl bg-red-50 border border-red-100">
            <p class="text-sm text-red-600">{{ error }}</p>
          </div>

          <button type="submit" :disabled="loading" class="btn-primary w-full !py-3 !text-base">
            <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            {{ loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ' }}
          </button>
        </form>
      </div>
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
    error.value = err.response?.data?.error || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
  } finally {
    loading.value = false;
  }
}
</script>
