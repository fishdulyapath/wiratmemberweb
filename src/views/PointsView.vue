<template>
  <div class="space-y-4">
    <h1 class="font-display text-xl font-bold text-navy-800">แต้มสะสม</h1>

    <!-- Point summary -->
    <div class="grid grid-cols-2 gap-3">
      <div class="card bg-gradient-to-br from-emerald-50 to-white">
        <p class="text-xs text-emerald-600 font-medium">แต้มคงเหลือ</p>
        <p class="font-display text-2xl font-bold text-emerald-700 mt-1">{{ formatNumber(customer?.point_balance) }}</p>
      </div>
      <div class="card bg-gradient-to-br from-navy-50 to-white">
        <p class="text-xs text-navy-500 font-medium">แต้มสะสมรวม</p>
        <p class="font-display text-2xl font-bold text-navy-700 mt-1">{{ formatNumber(customer?.reward_point) }}</p>
      </div>
    </div>

    <div v-if="loading" class="card flex items-center justify-center py-12">
      <svg class="animate-spin h-8 w-8 text-brand-500" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
      </svg>
    </div>

    <div v-else-if="items.length === 0" class="card text-center py-12 text-navy-400">
      ยังไม่มีข้อมูลแต้มสะสม
    </div>

    <div v-else class="space-y-3">
      <div v-for="item in items" :key="item.doc_no" @click="openDetail(item.doc_no)"
        class="card cursor-pointer hover:shadow-md hover:border-brand-200 transition-all">
        <div class="flex items-center justify-between">
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-navy-700 truncate">{{ getTransType(item) }}</p>
            <p class="text-xs text-navy-400 mt-0.5">{{ formatDate(item.doc_date) }} {{ item.doc_time }}</p>
            <p v-if="item.remark" class="text-xs text-navy-400 mt-0.5 truncate">{{ item.remark }}</p>
          </div>
          <div class="ml-3 text-right flex flex-col gap-1">
            <span v-if="item.get_point > 0" class="badge-get">+{{ item.get_point }} แต้ม</span>
            <span v-if="item.get_point < 0" class="badge-return">{{ item.get_point }} แต้ม</span>
            <span v-if="item.use_point > 0" class="badge-use">ใช้ {{ item.use_point }} แต้ม</span>
            <span v-if="item.use_point < 0" class="badge-get">คืน {{ Math.abs(item.use_point) }} แต้ม</span>
          </div>
        </div>
        <div v-if="Number(item.sum_sale_amount) > 0 || Number(item.sum_return_amount) > 0" class="mt-2 pt-2 border-t border-navy-50 flex gap-4 text-xs text-navy-400">
          <span v-if="Number(item.sum_sale_amount) > 0">ยอมขาย: {{ formatCurrency(item.sum_sale_amount) }}</span>
          <span v-if="Number(item.sum_return_amount) > 0">ยอดคืน: {{ formatCurrency(item.sum_return_amount) }}</span>
        </div>
      </div>
    </div>

    <Pagination :page="page" :totalPages="totalPages" @change="changePage" />

    <!-- Detail modal -->
    <ModalSheet :show="!!selectedDoc" :title="selectedDocTitle" subtitle="รายละเอียดแต้ม" :loading="detailLoading" @close="selectedDoc = null">
      <div v-if="detail">
        <div class="mb-4 p-3 rounded-xl bg-navy-50 text-xs space-y-1">
          <div class="grid grid-cols-2 gap-2">
            <div>
              <span class="text-navy-400">เลขที่:</span> <span class="text-navy-700 font-medium">{{ detail.header.doc_no_sale || detail.header.doc_no_return || detail.header.doc_no }}</span>
            </div>
            <div>
              <span class="text-navy-400">วันที่:</span> <span class="text-navy-700">{{ formatDate(detail.header.doc_date) }}</span>
            </div>
            <div v-if="Number(detail.header.get_point) > 0">
              <span class="text-navy-400">แต้มที่ได้:</span> <span class="text-emerald-600 font-medium">+{{ detail.header.get_point }}</span>
            </div>
            <div v-if="Number(detail.header.return_point) > 0">
              <span class="text-navy-400">แต้มที่คืน:</span> <span class="text-orange-600 font-medium">-{{ detail.header.return_point }}</span>
            </div>
          </div>

          <!-- Point Details -->
          <div v-if="detail && detail.details" class="mt-2 pt-2 border-t border-navy-100 space-y-1">
             <div v-for="(d, index) in detail.details.filter(x => x.description && (Number(x.get_point) > 0 || Number(x.return_point) > 0))" :key="index" class="text-xs flex justify-between">
                <span class="text-navy-500">{{ d.description }}</span>
                <span :class="(Number(d.get_point) || 0) - (Number(d.return_point) || 0) > 0 ? 'text-emerald-600' : 'text-orange-600'">
                  {{ (Number(d.get_point) || 0) - (Number(d.return_point) || 0) > 0 ? '+' : '' }}{{ (Number(d.get_point) || 0) - (Number(d.return_point) || 0) }} pt
                </span>
             </div>
          </div>
        </div>
        <div class="space-y-2">
          <div v-for="(d, i) in detail.details" :key="i" class="flex items-start justify-between py-2 border-b border-navy-50 last:border-0">
            <div class="flex-1 min-w-0">
              <p class="text-sm text-navy-700 truncate">{{ d.item_name }}</p>
              <p class="text-xs text-navy-400">{{ d.item_code }} · {{ d.qty }} {{ d.unit_code }}</p>
            </div>
            <div class="ml-3 text-right">
              <p class="text-sm font-medium text-navy-800">{{ formatCurrency(d.total_amount || d.sum_amount || 0) }}</p>
            </div>
          </div>
        </div>

        <!-- Description from details -->
        <div class="mt-4 p-3 rounded-xl bg-navy-50 text-xs text-navy-600"
          v-if="detail && detail.details && [...new Set(detail.details.map(d => d.description).filter(d => d && !((Number(d.get_point) > 0 || Number(d.return_point) > 0))))].length > 0">
           <p class="font-semibold mb-1">รายละเอียดรายรับแต้ม</p>
           <ul class="list-disc pl-4 space-y-1">
             <li v-for="(desc, index) in [...new Set(detail.details.map(d => d.description).filter(d => d && !((Number(d.get_point) > 0 || Number(d.return_point) > 0))))]" :key="index">
               {{ desc }}
             </li>
           </ul>
        </div>

      </div>
    </ModalSheet>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { customerApi, pointApi } from '../api';
import ModalSheet from '../components/ModalSheet.vue';
import Pagination from '../components/Pagination.vue';

const auth = useAuthStore();
const customer = ref(null);
const items = ref([]);
const loading = ref(true);
const page = ref(1);
const totalPages = ref(1);
const selectedDoc = ref(null);
const selectedDocTitle = ref('');
const detailLoading = ref(false);
const detail = ref(null);

const formatNumber = (n) => n == null ? '0' : Number(n).toLocaleString('th-TH');
const formatDate = (d) => d ? new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' }) : '-';
const formatCurrency = (n) => Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 });

function getTransType(item) {
  if (item.doc_no_sale) return `ซื้อสินค้า ${item.doc_no_sale}`;
  if (item.doc_no_return) return `คืนสินค้า ${item.doc_no_return}`;
  if (Number(item.use_point) > 0) return 'ใช้แต้ม';
  if (Number(item.use_point) < 0) return 'ยกเลิกการใช้แต้ม';
  if (Number(item.get_point) > 0) return 'เพิ่มแต้ม';
  return item.doc_no;
}

async function fetchData() {
  loading.value = true;
  try {
    const { data: custData } = await customerApi.me();
    customer.value = custData.customer;
  } catch {}
  try {
    const { data } = await pointApi.movement({ page: page.value, limit: 20 });
    items.value = data.data;
    totalPages.value = data.totalPages;
  } catch {}
  loading.value = false;
}

function changePage(p) { page.value = p; fetchData(); }

async function openDetail(docNo) {
  selectedDoc.value = docNo;
  selectedDocTitle.value = docNo;
  detailLoading.value = true;
  detail.value = null;
  try {
    const { data } = await pointApi.movementDetail(docNo);
    detail.value = data;
  } catch {}
  detailLoading.value = false;
}

onMounted(fetchData);
</script>
