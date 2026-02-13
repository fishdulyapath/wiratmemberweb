<template>
  <div class="space-y-4">
    <h1 class="font-display text-xl font-bold text-navy-800">ใช้แต้มสมาชิก</h1>

    <div class="card space-y-4">
      <div>
        <label class="block text-sm font-medium text-navy-600 mb-1.5">ค้นหาสมาชิก</label>
        <div class="flex gap-2">
          <input v-model="searchQuery" @keyup.enter="searchCustomer" type="text" class="input-field" placeholder="รหัสหรือชื่อสมาชิก">
          <button @click="searchCustomer" class="btn-secondary whitespace-nowrap">ค้นหา</button>
        </div>
      </div>

      <div v-if="searchResults.length > 0" class="max-h-40 overflow-y-auto rounded-xl border border-navy-100">
        <button v-for="c in searchResults" :key="c.code" @click="selectCustomer(c)"
          class="w-full px-4 py-2.5 text-left hover:bg-brand-50 transition-colors border-b border-navy-50 last:border-0"
          :class="selectedCustomer?.code === c.code ? 'bg-brand-50' : ''">
          <p class="text-sm font-medium text-navy-700">{{ c.name_1 }}</p>
          <p class="text-xs text-navy-400">{{ c.code }} · แต้มคงเหลือ: <span class="font-semibold text-emerald-600">{{ formatNumber(c.point_balance) }}</span></p>
        </button>
      </div>

      <div v-if="selectedCustomer" class="p-4 rounded-xl bg-brand-50 border border-brand-100 relative">
        <div class="pr-8">
          <p class="text-sm font-medium text-brand-800">{{ selectedCustomer.name_1 }}</p>
          <p class="text-xs text-brand-600">รหัส: {{ selectedCustomer.code }}</p>
          <p class="text-lg font-display font-bold text-brand-700 mt-1">แต้มคงเหลือ: {{ formatNumber(selectedCustomer.point_balance) }}</p>
        </div>
        <button @click="clearCustomer" class="absolute top-3 right-3 p-1.5 rounded-lg text-brand-600 hover:bg-brand-100 transition-colors" title="ยกเลิกการเลือก">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div>
        <label class="block text-sm font-medium text-navy-600 mb-1.5">จำนวนแต้มที่ต้องการใช้</label>
        <input v-model.number="points" type="number" min="1" :max="selectedCustomer?.point_balance || 0" class="input-field" placeholder="0">
        <p v-if="selectedCustomer && points > Number(selectedCustomer.point_balance)" class="text-xs text-red-500 mt-1">
          แต้มไม่เพียงพอ
        </p>
      </div>

      <div>
        <label class="block text-sm font-medium text-navy-600 mb-1.5">หมายเหตุ</label>
        <input v-model="remark" type="text" class="input-field" placeholder="หมายเหตุ (ไม่บังคับ)">
      </div>

      <button @click="usePoints" 
        :disabled="!selectedCustomer || !points || points <= 0 || points > Number(selectedCustomer?.point_balance || 0) || submitting" 
        class="btn-primary w-full">
        {{ submitting ? 'กำลังดำเนินการ...' : 'ใช้แต้ม' }}
      </button>

      <div v-if="success" class="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
        <p class="text-sm font-medium text-emerald-700">ใช้แต้มสำเร็จ!</p>
        <p class="text-xs text-emerald-600 mt-1">เลขที่: {{ success.doc_no }} · ใช้ {{ success.points_used }} แต้ม</p>
        <p class="text-xs text-emerald-600">แต้มคงเหลือใหม่: {{ formatNumber(success.customer?.point_balance) }}</p>
      </div>

      <div v-if="error" class="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">{{ error }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { customerApi, pointApi } from '../../api';

const searchQuery = ref('');
const searchResults = ref([]);
const selectedCustomer = ref(null);
const points = ref(null);
const remark = ref('');
const submitting = ref(false);
const success = ref(null);
const error = ref('');

const formatNumber = (n) => n == null ? '0' : Number(n).toLocaleString('th-TH');

async function searchCustomer() {
  if (!searchQuery.value.trim()) return;
  try {
    const { data } = await customerApi.search(searchQuery.value);
    searchResults.value = data.customers;
  } catch {}
}

function selectCustomer(c) {
  selectedCustomer.value = c;
  searchResults.value = [];
}

function clearCustomer() {
  selectedCustomer.value = null;
  searchQuery.value = '';
  points.value = null;
}

async function usePoints() {
  error.value = '';
  success.value = null;
  submitting.value = true;
  try {
    const { data } = await pointApi.use({
      cust_code: selectedCustomer.value.code,
      points: points.value,
      remark: remark.value || undefined,
    });
    success.value = data;
    selectedCustomer.value.point_balance = data.customer?.point_balance;
    points.value = null;
    remark.value = '';
  } catch (err) {
    error.value = err.response?.data?.error || 'เกิดข้อผิดพลาด';
  }
  submitting.value = false;
}
</script>
