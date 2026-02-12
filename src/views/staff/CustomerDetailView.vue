<template>
  <div class="space-y-4">
    <button @click="$router.back()" class="flex items-center gap-1 text-sm text-navy-500 hover:text-navy-700 transition-colors">
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      กลับ
    </button>

    <!-- Customer info -->
    <div v-if="customer" class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-800 to-navy-900 p-6 text-white">
      <div class="absolute top-0 right-0 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div class="relative">
        <h2 class="font-display text-xl font-bold">{{ customer.name_1 }}</h2>
        <p class="text-navy-400 text-xs mt-0.5">รหัส: {{ customer.code }}</p>
        <div class="mt-4 flex gap-6">
          <div>
            <p class="text-brand-300 text-xs font-medium">แต้มคงเหลือ</p>
            <p class="font-display text-3xl font-bold mt-0.5">{{ formatNumber(customer.point_balance) }}</p>
          </div>
          <div class="border-l border-navy-700 pl-6">
            <p class="text-navy-400 text-xs font-medium">แต้มสะสมรวม</p>
            <p class="font-display text-xl font-bold mt-0.5 text-navy-200">{{ formatNumber(customer.reward_point) }}</p>
          </div>
        </div>
        <button @click="recalc" :disabled="recalcing" class="mt-4 text-xs text-brand-300 hover:text-brand-200 underline">
          {{ recalcing ? 'กำลังคำนวณ...' : 'คำนวณแต้มใหม่' }}
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 bg-white rounded-xl p-1 border border-navy-100">
      <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key"
        class="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors"
        :class="activeTab === tab.key ? 'bg-brand-500 text-white shadow-sm' : 'text-navy-500 hover:bg-navy-50'">
        {{ tab.label }}
      </button>
    </div>

    <!-- Sales tab -->
    <div v-if="activeTab === 'sales'" class="space-y-3">
      <div v-if="sales.length === 0" class="card text-center py-8 text-navy-400 text-sm">ไม่พบข้อมูล</div>
      <div v-for="item in sales" :key="item.doc_no" @click="openSaleDetail(item.doc_no)"
        class="card cursor-pointer hover:shadow-md transition-all">
        <div class="flex justify-between items-center">
          <div>
            <p class="text-sm font-medium text-navy-700">{{ item.doc_no }}</p>
            <p class="text-xs text-navy-400">{{ formatDate(item.doc_date) }} {{ item.doc_time }}</p>
          </div>
          <svg class="w-4 h-4 text-navy-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
      <Pagination :page="salesPage" :totalPages="salesTotalPages" @change="p => { salesPage = p; fetchSales(); }" />
    </div>

    <!-- Returns tab -->
    <div v-if="activeTab === 'returns'" class="space-y-3">
      <div v-if="returns.length === 0" class="card text-center py-8 text-navy-400 text-sm">ไม่พบข้อมูล</div>
      <div v-for="item in returns" :key="item.doc_no" @click="openReturnDetail(item.doc_no)"
        class="card cursor-pointer hover:shadow-md transition-all">
        <div class="flex justify-between items-center">
          <div>
            <p class="text-sm font-medium text-navy-700">{{ item.doc_no }}</p>
            <p class="text-xs text-navy-400">{{ formatDate(item.doc_date) }}</p>
            <p v-if="item.doc_ref" class="text-xs text-amber-600">อ้างอิง: {{ item.doc_ref }}</p>
          </div>
          <svg class="w-4 h-4 text-navy-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
      <Pagination :page="returnsPage" :totalPages="returnsTotalPages" @change="p => { returnsPage = p; fetchReturns(); }" />
    </div>

    <!-- Points tab -->
    <div v-if="activeTab === 'points'" class="space-y-3">
      <div v-if="points.length === 0" class="card text-center py-8 text-navy-400 text-sm">ไม่พบข้อมูล</div>
      <div v-for="item in points" :key="item.doc_no" @click="openPointDetail(item.doc_no)"
        class="card cursor-pointer hover:shadow-md transition-all">
        <div class="flex justify-between items-center">
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-navy-700 truncate">{{ item.remark || item.doc_no }}</p>
            <p class="text-xs text-navy-400">{{ formatDate(item.doc_date) }} {{ item.doc_time }}</p>
          </div>
          <div class="ml-3 flex flex-col gap-1">
            <span v-if="Number(item.get_point) > 0" class="badge-get">+{{ item.get_point }}</span>
            <span v-if="Number(item.get_point) < 0" class="badge-return">{{ item.get_point }}</span>
            <span v-if="Number(item.use_point) > 0" class="badge-use">-{{ item.use_point }}</span>
            <span v-if="Number(item.use_point) < 0" class="badge-get">+{{ Math.abs(item.use_point) }}</span>
          </div>
        </div>
      </div>
      <Pagination :page="pointsPage" :totalPages="pointsTotalPages" @change="p => { pointsPage = p; fetchPoints(); }" />
    </div>

    <!-- Detail modal -->
    <ModalSheet :show="!!selectedDoc" :title="selectedDoc" :subtitle="modalSubtitle" :loading="detailLoading" @close="selectedDoc = null">
      <div v-if="detail">
        <div class="mb-4 p-3 rounded-xl bg-navy-50 text-xs space-y-1">
          <div class="grid grid-cols-2 gap-2">
            <div><span class="text-navy-400">เลขที่:</span> <span class="text-navy-700 font-medium">{{ detail.header.doc_no || detail.header.doc_no_sale || detail.header.doc_no_return }}</span></div>
            <div><span class="text-navy-400">วันที่:</span> <span class="text-navy-700">{{ formatDate(detail.header.doc_date) }}</span></div>
          </div>
        </div>
        <div class="space-y-2">
          <div v-for="(d, i) in detail.details" :key="i" class="flex items-start justify-between py-2 border-b border-navy-50 last:border-0">
            <div class="flex-1 min-w-0">
              <p class="text-sm text-navy-700 truncate">{{ d.item_name }}</p>
              <p class="text-xs text-navy-400">{{ d.item_code }} · {{ d.qty }} {{ d.unit_code }}</p>
            </div>
            <div class="ml-3 text-right">
              <p class="text-sm font-medium text-navy-800">{{ formatCurrency(d.sum_amount || d.sale_amount || d.return_amount || 0) }}</p>
              <p v-if="Number(d.get_point) > 0" class="text-xs text-emerald-600">+{{ d.get_point }} pt</p>
            </div>
          </div>
        </div>
      </div>
    </ModalSheet>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { customerApi, transactionApi, pointApi } from '../../api';
import ModalSheet from '../../components/ModalSheet.vue';
import Pagination from '../../components/Pagination.vue';

const route = useRoute();
const custCode = route.params.code;

const customer = ref(null);
const activeTab = ref('points');
const tabs = [
  { key: 'points', label: 'แต้มสะสม' },
  { key: 'sales', label: 'ประวัติซื้อ' },
  { key: 'returns', label: 'ประวัติคืน' },
];

const sales = ref([]); const salesPage = ref(1); const salesTotalPages = ref(1);
const returns = ref([]); const returnsPage = ref(1); const returnsTotalPages = ref(1);
const points = ref([]); const pointsPage = ref(1); const pointsTotalPages = ref(1);

const selectedDoc = ref(null);
const modalSubtitle = ref('');
const detailLoading = ref(false);
const detail = ref(null);
const recalcing = ref(false);

const formatNumber = (n) => n == null ? '0' : Number(n).toLocaleString('th-TH');
const formatDate = (d) => d ? new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' }) : '-';
const formatCurrency = (n) => Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 });

async function fetchCustomer() {
  try {
    const { data } = await customerApi.get(custCode);
    customer.value = data.customer;
  } catch {}
}

async function fetchSales() {
  try {
    const { data } = await transactionApi.sales({ cust_code: custCode, page: salesPage.value });
    sales.value = data.data;
    salesTotalPages.value = data.totalPages;
  } catch {}
}

async function fetchReturns() {
  try {
    const { data } = await transactionApi.returns({ cust_code: custCode, page: returnsPage.value });
    returns.value = data.data;
    returnsTotalPages.value = data.totalPages;
  } catch {}
}

async function fetchPoints() {
  try {
    const { data } = await pointApi.movement({ cust_code: custCode, page: pointsPage.value });
    points.value = data.data;
    pointsTotalPages.value = data.totalPages;
  } catch {}
}

async function recalc() {
  recalcing.value = true;
  try {
    await pointApi.recalc({ cust_code: custCode });
    await fetchCustomer();
    await fetchPoints();
  } catch {}
  recalcing.value = false;
}

async function openSaleDetail(docNo) {
  selectedDoc.value = docNo; modalSubtitle.value = 'รายละเอียดสินค้า';
  detailLoading.value = true; detail.value = null;
  try { const { data } = await transactionApi.saleDetail(docNo); detail.value = data; } catch {}
  detailLoading.value = false;
}

async function openReturnDetail(docNo) {
  selectedDoc.value = docNo; modalSubtitle.value = 'รายละเอียดสินค้าที่คืน';
  detailLoading.value = true; detail.value = null;
  try { const { data } = await transactionApi.returnDetail(docNo); detail.value = data; } catch {}
  detailLoading.value = false;
}

async function openPointDetail(docNo) {
  selectedDoc.value = docNo; modalSubtitle.value = 'รายละเอียดแต้ม';
  detailLoading.value = true; detail.value = null;
  try { const { data } = await pointApi.movementDetail(docNo); detail.value = data; } catch {}
  detailLoading.value = false;
}

onMounted(() => {
  fetchCustomer();
  fetchSales();
  fetchReturns();
  fetchPoints();
});
</script>
