<template>
  <div class="space-y-4">
    <h1 class="font-display text-xl font-bold text-navy-800">ยกเลิกการใช้แต้ม</h1>

    <div class="card space-y-4">
      <div class="p-3 rounded-xl bg-amber-50 border border-amber-100">
        <p class="text-sm text-amber-700">ใช้สำหรับยกเลิก/คืนแต้มที่สมาชิกเคยใช้ไปแล้ว โดยระบุเลขที่เอกสารการใช้แต้ม</p>
      </div>

      <!-- Search by doc_no -->
      <div>
        <label class="block text-sm font-medium text-navy-600 mb-1.5">เลขที่เอกสารการใช้แต้ม</label>
        <div class="flex gap-2">
          <input v-model="docNo" type="text" class="input-field" placeholder="PT-XXXXXXXX-XXXXXX">
          <button @click="searchDoc" :disabled="!docNo.trim() || searching" class="btn-secondary whitespace-nowrap">
            {{ searching ? '...' : 'ค้นหา' }}
          </button>
        </div>
      </div>

      <!-- Or search by customer first -->
      <div class="relative">
        <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-navy-200"></div></div>
        <div class="relative flex justify-center"><span class="bg-white px-3   text-navy-400">หรือค้นหาจากสมาชิก</span></div>
      </div>

      <div>
        <label class="block text-sm font-medium text-navy-600 mb-1.5">ค้นหาสมาชิก</label>
        <div class="flex gap-2">
          <input v-model="searchQuery" @keyup.enter="searchCustomer" type="text" class="input-field" placeholder="รหัสหรือชื่อสมาชิก">
          <button @click="searchCustomer" class="btn-secondary whitespace-nowrap">ค้นหา</button>
        </div>
      </div>

      <div v-if="searchResults.length > 0" class="max-h-40 overflow-y-auto rounded-xl border border-navy-100">
        <button v-for="c in searchResults" :key="c.code" @click="selectCustomer(c)"
          class="w-full px-4 py-2.5 text-left hover:bg-brand-50 transition-colors border-b border-navy-50 last:border-0">
          <p class="text-sm font-medium text-navy-700">{{ c.name_1 }}</p>
          <p class="  text-navy-400">{{ c.code }}</p>
        </button>
      </div>

      <!-- Use-point docs list for selected customer -->
      <div v-if="useDocs.length > 0" class="space-y-2">
        <h4 class="  font-medium text-navy-500 uppercase tracking-wider">รายการใช้แต้ม</h4>
        <button v-for="doc in useDocs" :key="doc.doc_no" @click="selectDoc(doc)"
          class="w-full card text-left hover:shadow-md transition-all"
          :class="selectedUseDoc?.doc_no === doc.doc_no ? 'ring-2 ring-brand-400' : ''">
          <div class="flex justify-between items-center">
            <div>
              <p class="text-sm font-medium text-navy-700">{{ doc.doc_no }}</p>
              <p class="  text-navy-400">{{ formatDate(doc.doc_date) }} {{ doc.doc_time }}</p>
              <p v-if="doc.remark" class="  text-navy-400 mt-0.5 truncate">{{ doc.remark }}</p>
            </div>
            <span class="badge-use">ใช้ {{ doc.use_point }} แต้ม</span>
          </div>
        </button>
      </div>

      <!-- Selected doc to cancel -->
      <div v-if="selectedUseDoc" class="p-4 rounded-xl bg-red-50 border border-red-100">
        <p class="text-sm font-medium text-red-800">ยืนยันยกเลิกการใช้แต้ม</p>
        <div class="mt-2 space-y-1   text-red-700">
          <p>เลขที่: <span class="font-semibold">{{ selectedUseDoc.doc_no }}</span></p>
          <p>สมาชิก: <span class="font-semibold">{{ selectedUseDoc.cust_code }}</span></p>
          <p>จำนวนแต้มที่จะคืน: <span class="font-semibold text-lg">{{ selectedUseDoc.use_point }}</span></p>
        </div>
      </div>

      <button @click="cancelUse" :disabled="!selectedUseDoc || submitting" class="btn-danger w-full">
        {{ submitting ? 'กำลังดำเนินการ...' : 'ยืนยันยกเลิกการใช้แต้ม' }}
      </button>

      <div v-if="success" class="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
        <p class="text-sm font-medium text-emerald-700">ยกเลิกการใช้แต้มสำเร็จ!</p>
        <p class="  text-emerald-600 mt-1">เลขที่ใหม่: {{ success.doc_no }}</p>
        <p class="  text-emerald-600">คืน {{ success.points_refunded }} แต้ม</p>
        <p class="  text-emerald-600">แต้มคงเหลือใหม่: {{ formatNumber(success.customer?.point_balance) }}</p>
      </div>

      <div v-if="error" class="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">{{ error }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { customerApi, pointApi } from '../../api';

const docNo = ref('');
const searchQuery = ref('');
const searchResults = ref([]);
const useDocs = ref([]);
const selectedUseDoc = ref(null);
const searching = ref(false);
const submitting = ref(false);
const success = ref(null);
const error = ref('');

const formatNumber = (n) => n == null ? '0' : Number(n).toLocaleString('th-TH');
const formatDate = (d) => d ? new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' }) : '-';

async function searchDoc() {
  if (!docNo.value.trim()) return;
  error.value = '';
  searching.value = true;
  try {
    const { data } = await pointApi.movementDetail(docNo.value.trim());
    const h = data.header;
    if (Number(h.use_point) <= 0) {
      error.value = 'เอกสารนี้ไม่ใช่รายการใช้แต้ม';
      selectedUseDoc.value = null;
    } else {
      selectedUseDoc.value = h;
    }
  } catch (err) {
    error.value = err.response?.data?.error || 'ไม่พบเอกสาร';
    selectedUseDoc.value = null;
  }
  searching.value = false;
}

async function searchCustomer() {
  if (!searchQuery.value.trim()) return;
  try {
    const { data } = await customerApi.search(searchQuery.value);
    searchResults.value = data.customers;
  } catch {}
}

async function selectCustomer(c) {
  searchResults.value = [];
  // Fetch use-point transactions for this customer
  try {
    const { data } = await pointApi.movement({ cust_code: c.code, limit: 100 });
    const all = data.data;
    // หา doc_no ที่ถูกยกเลิกแล้ว (remark ของ reversal จะขึ้นต้นด้วย "ยกเลิกการใช้แต้ม อ้างอิง <doc_no>")
    const cancelledDocNos = new Set(
      all.filter(d => Number(d.use_point) < 0 && d.remark)
        .map(d => {
          const m = d.remark.match(/อ้างอิง\s+(PT-[^\s]+)/);
          return m ? m[1] : null;
        })
        .filter(Boolean)
    );
    useDocs.value = all.filter(d => Number(d.use_point) > 0 && !cancelledDocNos.has(d.doc_no));
  } catch {}
}

function selectDoc(doc) {
  selectedUseDoc.value = doc;
}

async function cancelUse() {
  error.value = '';
  success.value = null;
  submitting.value = true;
  try {
    const { data } = await pointApi.cancelUse({ doc_no: selectedUseDoc.value.doc_no });
    success.value = data;
    selectedUseDoc.value = null;
    useDocs.value = [];
    docNo.value = '';
  } catch (err) {
    error.value = err.response?.data?.error || 'เกิดข้อผิดพลาด';
  }
  submitting.value = false;
}
</script>
