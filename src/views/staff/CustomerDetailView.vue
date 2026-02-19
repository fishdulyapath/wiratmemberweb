<template>
  <div class="space-y-4">
    <button @click="$router.back()" class="flex items-center gap-1 text-sm text-navy-500 hover:text-navy-700 transition-colors">
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      กลับ
    </button>

    <!-- Customer info -->
    <div v-if="customer" class="relative overflow-hidden rounded-3xl text-white p-6 shadow-lg transition-all duration-300" :class="levelInfo.bgClass">
      <div class="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div class="relative">
        <h2 class="font-display text-xl font-bold">{{ customer.name_1 }}</h2>
        <p class="text-white/60 mt-0.5">รหัส: {{ customer.code }}</p>
        <div class="mt-4 flex gap-6">
          <div>
            <p class="text-white/70 font-medium">แต้มคงเหลือ</p>
            <p class="font-display text-3xl font-bold mt-0.5">{{ formatNumber(customer.point_balance) }}</p>
          </div>
          <div class="border-l border-white/20 pl-6">
            <p class="text-white/70 font-medium">แต้มสะสมรวม</p>
            <p class="font-display text-xl font-bold mt-0.5 text-white/90">{{ formatNumber(customer.reward_point) }}</p>
          </div>
        </div>
        <button @click="recalc" :disabled="recalcing" class="mt-4 text-white/60 hover:text-white underline">
          {{ recalcing ? "กำลังคำนวณ..." : "คำนวณแต้มใหม่" }}
        </button>
      </div>

      <!-- Membership Level Badge -->
      <div class="absolute bottom-6 right-6 text-right">
        <p class="text-[10px] text-white/60 uppercase tracking-widest mb-0.5">Level</p>
        <p class="font-display text-xl font-black italic tracking-wide text-white drop-shadow-md opacity-90">{{ levelInfo.name }}</p>
      </div>
    </div>

    <!-- Credit Detail Summary -->
    <div v-if="creditDetail" class="grid grid-cols-2 gap-3">
      <div class="card">
        <p class="text-navy-400 text-xs font-medium">วงเงินเครดิต</p>
        <p class="font-display text-lg font-bold text-navy-800 mt-1">{{ creditDetail.data_head.credit_money }}</p>
      </div>
      <div class="card">
        <p class="text-navy-400 text-xs font-medium">สั่งขาย</p>
        <p class="font-display text-lg font-bold text-blue-600 mt-1">{{ creditDetail.data_head.sum_sr }}</p>
      </div>
      <div class="card">
        <p class="text-navy-400 text-xs font-medium">เช็คคงค้าง</p>
        <p class="font-display text-lg font-bold text-amber-600 mt-1">{{ creditDetail.data_head.sum_cheque }}</p>
      </div>
      <div class="card">
        <p class="text-navy-400 text-xs font-medium">หนี้คงค้าง</p>
        <p class="font-display text-lg font-bold text-red-600 mt-1">{{ creditDetail.data_head.sum_status }}</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 bg-white rounded-xl p-1 border border-navy-100">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="activeTab = tab.key"
        class="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors"
        :class="activeTab === tab.key ? 'bg-brand-500 text-white shadow-sm' : 'text-navy-500 hover:bg-navy-50'"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Sales tab -->
    <div v-if="activeTab === 'sales'" class="space-y-3">
      <div v-if="sales.length === 0" class="card text-center py-8 text-navy-400 text-sm">ไม่พบข้อมูล</div>
      <div v-for="item in sales" :key="item.doc_no" @click="openSaleDetail(item.doc_no)" class="card cursor-pointer hover:shadow-md transition-all">
        <div class="flex justify-between items-center">
          <div>
            <div class="flex items-center gap-2">
              <p class="text-sm font-medium text-navy-700">{{ item.doc_no }}</p>
              <span class="text-xs px-2 py-0.5 rounded-full font-medium" :class="paymentBadge(item).cls">{{ paymentBadge(item).label }}</span>
            </div>
            <p class="text-navy-400">{{ formatDate(item.doc_date) }} {{ item.doc_time }}</p>
            <p class="text-navy-400"><span class="text-xs">มูลค่า</span> {{ formatCurrency(item.total_amount) }}</p>
          </div>
          <svg class="w-4 h-4 text-navy-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
      <Pagination
        :page="salesPage"
        :totalPages="salesTotalPages"
        @change="
          (p) => {
            salesPage = p;
            fetchSales();
          }
        "
      />
    </div>

    <!-- Returns tab -->
    <div v-if="activeTab === 'returns'" class="space-y-3">
      <div v-if="returns.length === 0" class="card text-center py-8 text-navy-400 text-sm">ไม่พบข้อมูล</div>
      <div v-for="item in returns" :key="item.doc_no" @click="openReturnDetail(item.doc_no)" class="card cursor-pointer hover:shadow-md transition-all">
        <div class="flex justify-between items-center">
          <div>
            <p class="text-sm font-medium text-navy-700">{{ item.doc_no }}</p>
            <p class="text-navy-400">{{ formatDate(item.doc_date) }}  {{ item.doc_time }}</p>
            <p v-if="item.doc_ref" class="text-amber-600">อ้างอิง: {{ item.doc_ref }}</p>
            <p class="text-navy-400"><span class="text-xs">มูลค่า</span> {{ formatCurrency(item.total_amount) }}</p>
          </div>
          <svg class="w-4 h-4 text-navy-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
      <Pagination
        :page="returnsPage"
        :totalPages="returnsTotalPages"
        @change="
          (p) => {
            returnsPage = p;
            fetchReturns();
          }
        "
      />
    </div>

    <!-- Points tab -->
    <div v-if="activeTab === 'points'" class="space-y-3">
      <div v-if="points.length === 0" class="card text-center py-8 text-navy-400 text-sm">ไม่พบข้อมูล</div>
      <div v-for="item in points" :key="item.doc_no" @click="openPointDetail(item.doc_no)" class="card cursor-pointer hover:shadow-md transition-all">
        <div class="flex justify-between items-center">
          <div class="flex-1 min-w-0">
            <!-- <p class="text-sm font-medium text-navy-700 truncate">{{ item.doc_no }}</p> -->
            <p class="text-sm font-medium text-navy-700 truncate" v-if="item.doc_no_sale != null">{{ item.doc_no_sale }}</p>
            <p class="text-sm font-medium text-navy-700 truncate" v-if="item.doc_no_return != null">{{ item.doc_no_return }}</p>
            <p class="text-sm font-medium text-navy-700 truncate" v-if="item.doc_no != null">{{ item.remark }}</p>

            <p class="text-navy-400">{{ formatDate(item.doc_date) }} {{ item.doc_time }}</p>
            <p class="text-navy-400">{{ item.doc_no }}</p>
          </div>
          <div class="ml-3 flex flex-col gap-1">
            <span v-if="Number(item.get_point) > 0" class="badge-get">+{{ item.get_point }}</span>
            <span v-if="Number(item.get_point) < 0" class="badge-return">{{ item.get_point }}</span>
            <span v-if="Number(item.use_point) > 0" class="badge-use">-{{ item.use_point }}</span>
            <span v-if="Number(item.use_point) < 0" class="badge-get">+{{ Math.abs(item.use_point) }}</span>
            <span v-if="Number(item.return_point) > 0" class="badge-return">-{{ item.return_point }}</span>
          </div>
        </div>
      </div>
      <Pagination
        :page="pointsPage"
        :totalPages="pointsTotalPages"
        @change="
          (p) => {
            pointsPage = p;
            fetchPoints();
          }
        "
      />
    </div>

    <!-- Credit: รายการเอกสาร -->
    <div v-if="activeTab === 'credit_docs'" class="space-y-2">
      <div v-if="creditDetail" class="card py-3 bg-navy-50 flex justify-between items-center">
        <span class="text-sm font-medium text-navy-600">ยอดรวมหนี้คงค้าง</span>
        <span class="font-display text-lg font-bold text-red-600">{{ creditDetail.data_head.sum_status }}</span>
      </div>
      <div v-if="!creditDetail || creditDetail.data_1.length === 0" class="card text-center py-8 text-navy-400 text-sm">ไม่พบข้อมูล</div>
      <div v-else v-for="(item, i) in creditDetail.data_1" :key="i" class="card py-3">
        <div class="flex justify-between items-start">
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium text-navy-700">{{ item.doc_no }}</p>
            <p class="text-xs text-navy-400 mt-0.5">{{ formatDate(item.doc_date) }} · ครบกำหนด {{ formatDate(item.due_date) }}</p>
            <p v-if="item.remark" class="text-xs text-navy-400 mt-0.5">{{ item.remark }}</p>
          </div>
          <div class="text-right ml-3">
            <p class="text-sm font-medium" :class="Number(item.amount) < 0 ? 'text-emerald-600' : 'text-navy-800'">{{ formatCurrency(item.amount) }}</p>
            <p class="text-xs text-navy-400">คงค้าง {{ formatCurrency(item.ar_balance) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Credit: รายการเช็ค -->
    <div v-if="activeTab === 'credit_cheques'" class="space-y-2">
      <div v-if="creditDetail" class="card py-3 bg-navy-50 flex justify-between items-center">
        <span class="text-sm font-medium text-navy-600">ยอดรวมเช็คคงค้าง</span>
        <span class="font-display text-lg font-bold text-amber-600">{{ creditDetail.data_head.sum_cheque }}</span>
      </div>
      <div v-if="!creditDetail || creditDetail.data_2.length === 0" class="card text-center py-8 text-navy-400 text-sm">ไม่พบข้อมูล</div>
      <div v-else v-for="(item, i) in creditDetail.data_2" :key="i" class="card py-3">
        <div class="flex justify-between items-start">
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium text-navy-700">{{ item.chq_number }}</p>
            <p class="text-xs text-navy-400 mt-0.5">รับเช็ค {{ formatDate(item.chq_get_date) }} · ครบกำหนด {{ formatDate(item.chq_due_date) }}</p>
            <p v-if="item.doc_ref" class="text-xs text-navy-400 mt-0.5">อ้างอิง: {{ item.doc_ref }}</p>
          </div>
          <div class="text-right ml-3">
            <p class="text-sm font-medium text-navy-800">{{ formatCurrency(item.amount) }}</p>
            <span class="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">{{ item.status }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Credit: SR/SS -->
    <div v-if="activeTab === 'credit_srss'" class="space-y-2">
      <div v-if="creditDetail" class="card py-3 bg-navy-50 flex justify-between items-center">
        <span class="text-sm font-medium text-navy-600">ยอดรวมสั่งขาย</span>
        <span class="font-display text-lg font-bold text-blue-600">{{ creditDetail.data_head.sum_sr }}</span>
      </div>
      <div v-if="!creditDetail || creditDetail.data_3.length === 0" class="card text-center py-8 text-navy-400 text-sm">ไม่พบข้อมูล</div>
      <div v-else v-for="(item, i) in creditDetail.data_3" :key="i" class="card py-3">
        <div class="flex justify-between items-start">
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium text-navy-700">{{ item.doc_no }}</p>
            <p class="text-xs text-navy-400 mt-0.5">{{ formatDate(item.doc_date) }}</p>
            <p v-if="item.remark" class="text-xs text-navy-400 mt-0.5">{{ item.remark }}</p>
          </div>
          <div class="text-right ml-3">
            <p class="text-sm font-medium text-navy-800">{{ formatCurrency(item.total_amount) }}</p>
            <span class="inline-block mt-1 text-xs px-2 py-0.5 rounded-full" :class="String(item.trans_flag) === '36' ? 'bg-blue-50 text-blue-700' : 'bg-navy-50 text-navy-600'">
              {{ String(item.trans_flag) === '34' ? 'SR' : 'SS' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail modal -->
    <ModalSheet :show="!!selectedDoc" :title="selectedDoc" :subtitle="modalSubtitle" :loading="detailLoading" @close="selectedDoc = null">
      <div v-if="detail">
        <!-- Sale / Return detail -->
        <template v-if="modalSubtitle !== 'รายละเอียดแต้ม'">
          <div class="mb-3 p-3 rounded-xl bg-navy-50 text-xs flex gap-4">
            <div><span class="text-navy-400">วันที่: </span><span class="text-navy-700">{{ formatDate(detail.header.doc_date) }}</span></div>
          </div>
          <div class="space-y-2">
            <div v-for="(d, i) in detail.details" :key="i" class="flex items-start justify-between py-2 border-b border-navy-50 last:border-0">
              <div class="flex-1 min-w-0">
                <p class="text-sm text-navy-700 truncate">{{ d.item_name }}</p>
                <p class="text-xs text-navy-400">{{ d.item_code }} · {{ d.qty }} {{ d.unit_code }}</p>
              </div>
              <p class="text-sm font-medium text-navy-800 ml-3 whitespace-nowrap">{{ formatCurrency(d.total_amount || d.sum_amount || 0) }}</p>
            </div>
          </div>
          <div class="mt-3 pt-3 border-t border-navy-200 flex justify-between">
            <span class="font-medium text-navy-600">รวมทั้งสิ้น</span>
            <span class="font-display font-bold text-navy-800">{{ formatCurrency(detail.header.total_amount || detail.header.sum_total_amount || 0) }}</span>
          </div>
        </template>

        <!-- Point detail — grouped by description -->
        <template v-else>
          <div class="mb-3 p-3 rounded-xl bg-navy-50 text-xs flex gap-4">
            <div><span class="text-navy-400">วันที่: </span><span class="text-navy-700">{{ formatDate(detail.header.doc_date) }}</span></div>
            <div v-if="Number(detail.header.get_point) > 0"><span class="text-emerald-600 font-medium">+{{ detail.header.get_point }} แต้ม</span></div>
            <div v-if="Number(detail.header.return_point) > 0"><span class="text-orange-600 font-medium">-{{ detail.header.return_point }} แต้ม</span></div>
          </div>
          <div class="space-y-1">
            <div v-for="(group, gi) in groupedDetails(detail.details)" :key="gi">
              <div v-for="(d, di) in group.items" :key="`item-${gi}-${di}`" class="flex items-start justify-between py-2 border-b border-navy-50">
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-navy-700 truncate">{{ d.item_name }}</p>
                  <p class="text-xs text-navy-400">{{ d.item_code }} · {{ d.qty }} {{ d.unit_code }}</p>
                </div>
                <p class="text-sm font-medium text-navy-800 ml-3 whitespace-nowrap">{{ formatCurrency(d.total_amount || d.sum_amount || 0) }}</p>
              </div>
              <div class="flex items-center justify-between py-1.5 px-2 bg-emerald-50 rounded-lg mt-1 mb-2">
                <span class="text-xs text-emerald-700">{{ group.description || 'รวม' }}</span>
                <span class="text-xs font-medium text-emerald-700">{{ formatCurrency(group.total) }}</span>
              </div>
            </div>
          </div>
          <div class="mt-3 pt-3 border-t border-navy-200 flex justify-between">
            <span class="font-medium text-navy-600">รวมทั้งสิ้น</span>
            <span class="font-display font-bold text-navy-800">{{ formatCurrency(detail.header.sum_total_amount || detail.header.total_amount || 0) }}</span>
          </div>
        </template>
      </div>
    </ModalSheet>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { customerApi, transactionApi, pointApi } from "../../api";
import ModalSheet from "../../components/ModalSheet.vue";
import Pagination from "../../components/Pagination.vue";

const route = useRoute();
const custCode = route.params.code;

const customer = ref(null);
const activeTab = ref("points");
const tabs = [
  { key: "points", label: "แต้มสะสม" },
  { key: "sales", label: "ประวัติซื้อ" },
  { key: "returns", label: "ประวัติคืน" },
  { key: "credit_docs", label: "รายการคงค้าง" },
  { key: "credit_cheques", label: "เช็ค" },
  { key: "credit_srss", label: "SR/SS" },
];
const creditDetail = ref(null);

const sales = ref([]);
const salesPage = ref(1);
const salesTotalPages = ref(1);
const returns = ref([]);
const returnsPage = ref(1);
const returnsTotalPages = ref(1);
const points = ref([]);
const pointsPage = ref(1);
const pointsTotalPages = ref(1);

const levelInfo = computed(() => {
  const points = Number(customer.value?.reward_point || 0);
  if (points >= 2000) {
    return {
      name: "PLATINUM",
      bgClass: "bg-gradient-to-br from-slate-700 via-slate-800 to-black",
    };
  } else if (points >= 800) {
    return {
      name: "GOLD",
      bgClass: "bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600",
    };
  } else if (points >= 300) {
    return {
      name: "SILVER",
      bgClass: "bg-gradient-to-br from-gray-300 via-gray-400 to-slate-500",
    };
  } else {
    return {
      name: "COPPER",
      bgClass: "bg-gradient-to-br from-orange-300 via-orange-400 to-amber-600",
    };
  }
});

const selectedDoc = ref(null);
const modalSubtitle = ref("");
const detailLoading = ref(false);
const detail = ref(null);
const recalcing = ref(false);

const formatNumber = (n) => (n == null ? "0" : Number(n).toLocaleString("th-TH"));
const formatDate = (d) => (d ? new Date(d).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" }) : "-");
const formatCurrency = (n) => Number(n || 0).toLocaleString("th-TH", { minimumFractionDigits: 2 });

function groupedDetails(details) {
  if (!details?.length) return [];
  const groups = [];
  let current = null;
  for (const d of details) {
    const key = d.description || null;
    if (!current || current.description !== key) {
      current = { description: key, items: [], total: 0 };
      groups.push(current);
    }
    current.items.push(d);
    current.total += Number(d.total_amount || d.sum_amount || 0);
  }
  return groups;
}

function paymentBadge(item) {
  if (item.status === 'pending') return { label: 'คงค้าง', cls: 'bg-red-50 text-red-600' };
  if (item.status === 'success' && Number(item.balance) > 0) return { label: 'ชำระบางส่วน', cls: 'bg-orange-50 text-orange-600' };
  if (item.status === 'success') return { label: 'ชำระแล้ว', cls: 'bg-emerald-50 text-emerald-600' };
  return { label: '-', cls: 'bg-navy-50 text-navy-400' };
}

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

async function fetchCreditDetail() {
  try {
    const { data } = await customerApi.getCreditDetail(custCode);
    if (data.success) creditDetail.value = data;
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
  selectedDoc.value = docNo;
  modalSubtitle.value = "รายละเอียดสินค้า";
  detailLoading.value = true;
  detail.value = null;
  try {
    const { data } = await transactionApi.saleDetail(docNo);
    detail.value = data;
  } catch {}
  detailLoading.value = false;
}

async function openReturnDetail(docNo) {
  selectedDoc.value = docNo;
  modalSubtitle.value = "รายละเอียดสินค้าที่คืน";
  detailLoading.value = true;
  detail.value = null;
  try {
    const { data } = await transactionApi.returnDetail(docNo);
    detail.value = data;
  } catch {}
  detailLoading.value = false;
}

async function openPointDetail(docNo) {
  selectedDoc.value = docNo;
  modalSubtitle.value = "รายละเอียดแต้ม";
  detailLoading.value = true;
  detail.value = null;
  try {
    const { data } = await pointApi.movementDetail(docNo);
    detail.value = data;
  } catch {}
  detailLoading.value = false;
}

onMounted(() => {
  fetchCustomer();
  fetchSales();
  fetchReturns();
  fetchPoints();
  fetchCreditDetail();
});
</script>
