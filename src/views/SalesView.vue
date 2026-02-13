<template>
  <div class="space-y-4">
    <h1 class="font-display text-xl font-bold text-navy-800">ประวัติการซื้อสินค้า</h1>

    <div v-if="loading" class="card flex items-center justify-center py-12">
      <svg class="animate-spin h-8 w-8 text-brand-500" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
      </svg>
    </div>

    <div v-else-if="items.length === 0" class="card text-center py-12 text-navy-400">ไม่พบข้อมูลการซื้อสินค้า</div>

    <div v-else class="space-y-3">
      <div v-for="item in items" :key="item.doc_no" @click="openDetail(item.doc_no)" class="card cursor-pointer hover:shadow-md hover:border-brand-200 transition-all">
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-navy-700 text-sm">{{ item.doc_no }}</p>
            <p class="text-xs text-navy-400 mt-0.5">{{ formatDate(item.doc_date) }} {{ item.doc_time }}</p>
          </div>
          <svg class="w-4 h-4 text-navy-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>

    <Pagination :page="page" :totalPages="totalPages" @change="changePage" />

    <!-- Detail modal -->
    <ModalSheet :show="!!selectedDoc" :title="selectedDoc" subtitle="รายละเอียดสินค้า" :loading="detailLoading" @close="selectedDoc = null">
      <div v-if="detail">
        <div class="mb-4 p-3 rounded-xl bg-navy-50">
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span class="text-navy-400">เลขที่:</span> <span class="text-navy-700 font-medium">{{ detail.header.doc_no }}</span>
            </div>
            <div>
              <span class="text-navy-400">วันที่:</span> <span class="text-navy-700">{{ formatDate(detail.header.doc_date) }}</span>
            </div>
          </div>
        </div>
        <div class="space-y-2">
          <div v-for="(d, i) in detail.details" :key="i" class="flex items-start justify-between py-2 border-b border-navy-50 last:border-0">
            <div class="flex-1 min-w-0">
              <p class="text-sm text-navy-700 truncate">{{ d.item_name }}</p>
              <p class="text-xs text-navy-400">{{ d.item_code }} · {{ d.qty }} {{ d.unit_code }}</p>
            </div>
            <p class="text-sm font-medium text-navy-800 ml-3 whitespace-nowrap">{{ formatCurrency(d.sum_amount) }}</p>
          </div>
        </div>
        <div class="mt-2 pt-2 border-t border-navy-200">
          <div class="mt-1 flex justify-between" v-if="detail.header.total_discount > 0 ">
            <span class="font-medium text-navy-600">ส่วนลด</span>
            <span class="font-display font-bold text-navy-800">
              {{ formatCurrency(detail.header.total_discount || 0) }}
            </span>
          </div>
          <div class="mt-1 flex justify-between">
            <span class="font-medium text-navy-600">รวมทั้งสิ้น</span>
            <span class="font-display font-bold text-navy-800">
              {{ formatCurrency(detail.header.total_amount || detail.header.sum_total_amount || 0) }}
            </span>
          </div>
        </div>
      </div>
    </ModalSheet>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "../stores/auth";
import { transactionApi } from "../api";
import ModalSheet from "../components/ModalSheet.vue";
import Pagination from "../components/Pagination.vue";

const auth = useAuthStore();
const items = ref([]);
const loading = ref(true);
const page = ref(1);
const totalPages = ref(1);
const selectedDoc = ref(null);
const detailLoading = ref(false);
const detail = ref(null);

const formatDate = (d) => (d ? new Date(d).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" }) : "-");
const formatCurrency = (n) => Number(n || 0).toLocaleString("th-TH", { minimumFractionDigits: 2 });

async function fetchData() {
  loading.value = true;
  try {
    const params = { page: page.value, limit: 20 };
    if (auth.isStaff && !params.cust_code) return;
    const { data } = await transactionApi.sales(params);
    items.value = data.data;
    totalPages.value = data.totalPages;
  } catch {}
  loading.value = false;
}

function changePage(p) {
  page.value = p;
  fetchData();
}

async function openDetail(docNo) {
  selectedDoc.value = docNo;
  detailLoading.value = true;
  detail.value = null;
  try {
    const { data } = await transactionApi.saleDetail(docNo);
    detail.value = data;
  } catch {}
  detailLoading.value = false;
}

onMounted(fetchData);
</script>
