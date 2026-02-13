<template>
  <div class="space-y-4">
    <h1 class="font-display text-xl font-bold text-navy-800">ค้นหาสมาชิก</h1>

    <div class="card">
      <div class="flex gap-2">
        <input v-model="query" @keyup.enter="search" type="text" class="input-field" placeholder="ค้นหาด้วยรหัสหรือชื่อสมาชิก...">
        <button @click="search" :disabled="searching" class="btn-primary whitespace-nowrap">
          {{ searching ? '...' : 'ค้นหา' }}
        </button>
      </div>
    </div>

    <div v-if="customers.length > 0" class="space-y-3">
      <router-link v-for="c in customers" :key="c.code" :to="`/staff/customer/${c.code}`"
        class="card block hover:shadow-md hover:border-brand-200 transition-all">
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-navy-700">{{ c.name_1 }}</p>
            <p class="  text-navy-400 mt-0.5">รหัส: {{ c.code }}</p>
          </div>
          <div class="text-right">
            <p class="text-sm font-bold text-emerald-600">{{ formatNumber(c.point_balance) }}</p>
            <p class="  text-navy-400">แต้มคงเหลือ</p>
          </div>
        </div>
      </router-link>
    </div>

    <div v-else-if="searched" class="card text-center py-8 text-navy-400">
      ไม่พบสมาชิก
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { customerApi } from '../../api';

const query = ref('');
const customers = ref([]);
const searching = ref(false);
const searched = ref(false);

const formatNumber = (n) => n == null ? '0' : Number(n).toLocaleString('th-TH');

async function search() {
  if (!query.value.trim()) return;
  searching.value = true;
  searched.value = true;
  try {
    const { data } = await customerApi.search(query.value);
    customers.value = data.customers;
  } catch {}
  searching.value = false;
}
</script>
