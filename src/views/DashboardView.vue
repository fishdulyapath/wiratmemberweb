<template>
  <div class="space-y-6">
    <!-- Member Dashboard -->
    <template v-if="auth.isMember">
      <!-- Point balance hero card -->
      <div class="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white transition-all duration-500 shadow-xl shadow-navy-200"
        :class="levelInfo.bgClass">
        
        <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div class="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        <div class="relative">
          <h2 class="font-display text-xl sm:text-2xl font-bold mt-0.5">{{ customer?.name_1 || auth.user?.display_name }}</h2>
          <p class="text-white/60 text-xs  mt-1">รหัสสมาชิก: {{ customer?.code }}</p>

          <div class="mt-6 flex flex-col sm:flex-row gap-6">
            <div>
              <p class="text-white/70 text-xs  font-medium uppercase tracking-wider">แต้มคงเหลือ</p>
              <p class="font-display text-4xl sm:text-5xl font-bold mt-1 text-white">
                {{ formatNumber(customer?.point_balance) }}
              </p>
            </div>
            <div class="sm:border-l sm:border-white/20 sm:pl-6">
              <p class="text-white/70 text-xs  font-medium uppercase tracking-wider">แต้มสะสมทั้งหมด</p>
              <p class="font-display text-2xl font-bold mt-1 text-white/90">
                {{ formatNumber(customer?.reward_point) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Membership Level Badge -->
        <div class="absolute bottom-6 right-6 text-right">
             <p class="  text-white/60 uppercase tracking-widest text-xs mb-1">Membership</p>
             <p class="font-display text-2xl font-black italic tracking-wide text-white drop-shadow-lg opacity-90">{{ levelInfo.name }}</p>
        </div>
      </div>

      <!-- Credit Detail Summary -->
      <div v-if="creditDetail" class="grid grid-cols-2 gap-3">
        <div class="card">
          <p class="text-navy-400 text-xs font-medium">วงเงินเครดิต</p>
          <p class="font-display text-lg font-bold text-navy-800 mt-1">{{ creditDetail.data_head.credit_money }}</p>
        </div>
        <div class="card">
          <p class="text-navy-400 text-xs font-medium">สั่งจอง/สั่งซื้อ</p>
          <p class="font-display text-lg font-bold text-blue-600 mt-1">{{ creditDetail.data_head.sum_ss }}</p>
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

      <!-- Credit Detail Tabs -->
      <div v-if="creditDetail" class="space-y-3">
        <div class="flex gap-1 bg-white rounded-xl p-1 border border-navy-100">
          <button v-for="ct in creditTabs" :key="ct.key" @click="activeCreditTab = ct.key"
            class="flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors"
            :class="activeCreditTab === ct.key ? 'bg-brand-500 text-white shadow-sm' : 'text-navy-500 hover:bg-navy-50'">
            {{ ct.label }}
          </button>
        </div>

        <!-- data_1: รายการเอกสาร -->
        <div v-if="activeCreditTab === 'docs'" class="space-y-2">
          <div class="card py-3 bg-navy-50 flex justify-between items-center">
            <span class="text-sm font-medium text-navy-600">ยอดรวมหนี้คงค้าง</span>
            <span class="font-display text-lg font-bold text-red-600">{{ creditDetail.data_head.sum_status }}</span>
          </div>
          <div v-if="creditDetail.data_1.length === 0" class="card text-center py-6 text-navy-400 text-sm">ไม่พบข้อมูล</div>
          <div v-for="(item, i) in creditDetail.data_1" :key="i" class="card py-3">
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

        <!-- data_2: รายการเช็ค -->
        <div v-if="activeCreditTab === 'cheques'" class="space-y-2">
          <div class="card py-3 bg-navy-50 flex justify-between items-center">
            <span class="text-sm font-medium text-navy-600">ยอดรวมเช็คคงค้าง</span>
            <span class="font-display text-lg font-bold text-amber-600">{{ creditDetail.data_head.sum_cheque }}</span>
          </div>
          <div v-if="creditDetail.data_2.length === 0" class="card text-center py-6 text-navy-400 text-sm">ไม่พบข้อมูล</div>
          <div v-for="(item, i) in creditDetail.data_2" :key="i" class="card py-3">
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

        <!-- data_3: SR/SS -->
        <div v-if="activeCreditTab === 'srss'" class="space-y-2">
          <div class="card py-3 bg-navy-50 flex justify-between items-center">
            <span class="text-sm font-medium text-navy-600">ยอดรวมสั่งขาย</span>
            <span class="font-display text-lg font-bold text-blue-600">{{ creditDetail.data_head.sumsrss }}</span>
          </div>
          <div v-if="creditDetail.data_3.length === 0" class="card text-center py-6 text-navy-400 text-sm">ไม่พบข้อมูล</div>
          <div v-for="(item, i) in creditDetail.data_3" :key="i" class="card py-3">
            <div class="flex justify-between items-start">
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-navy-700">{{ item.doc_no }}</p>
                <p class="text-xs text-navy-400 mt-0.5">{{ formatDate(item.doc_date) }}</p>
                <p v-if="item.remark" class="text-xs text-navy-400 mt-0.5">{{ item.remark }}</p>
              </div>
              <div class="text-right ml-3">
                <p class="text-sm font-medium text-navy-800">{{ formatCurrency(item.total_amount) }}</p>
                <span class="inline-block mt-1 text-xs px-2 py-0.5 rounded-full" :class="String(item.trans_flag) === '36' ? 'bg-blue-50 text-blue-700' : 'bg-navy-50 text-navy-600'">
                  {{ String(item.trans_flag) === '34' ? 'SR' : 'SO' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick links -->
      <div class="grid grid-cols-3 gap-3">
        <router-link to="/sales" class="card text-center hover:shadow-md transition-shadow group">
          <div class="w-10 h-10 mx-auto rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
          </div>
          <p class="  font-medium text-navy-600 text-xs mt-2">ประวัติซื้อ</p>
        </router-link>
        <router-link to="/returns" class="card text-center hover:shadow-md transition-shadow group">
          <div class="w-10 h-10 mx-auto rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </div>
          <p class="  font-medium text-navy-600 text-xs mt-2">ประวัติคืน</p>
        </router-link>
        <router-link to="/points" class="card text-center hover:shadow-md transition-shadow group">
          <div class="w-10 h-10 mx-auto rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <p class="  font-medium text-navy-600 text-xs  mt-2">แต้มสะสม</p>
        </router-link>
      </div>

      <!-- Recent point movements -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-display font-semibold text-navy-800">ความเคลื่อนไหวล่าสุด</h3>
          <router-link to="/points" class="text-sm text-brand-600 hover:text-brand-700 font-medium">ดูทั้งหมด →</router-link>
        </div>
        <div v-if="recentPoints.length === 0" class="text-center py-8 text-navy-400 text-sm">
          ยังไม่มีข้อมูล
        </div>
        <div v-else class="space-y-3">
          <div v-for="item in recentPoints" :key="item.doc_no" class="flex items-center justify-between py-2 border-b border-navy-50 last:border-0">
            <div>
              <p class="text-sm font-medium text-navy-700">{{  item.remark || item.doc_no }}</p>
                 <p class="  text-navy-400">{{  item.doc_no_sale || item.doc_no  }}</p>
              <p class="  text-navy-400">{{ formatDate(item.doc_date) }}</p>
            </div>
            <div class="text-right">
              <span v-if="item.get_point > 0" class="badge-get">+{{ item.get_point }}</span>
              <span v-else-if="item.get_point < 0" class="badge-return">{{ item.get_point }}</span>
              <span v-if="item.use_point > 0" class="badge-use">-{{ item.use_point }}</span>
              <span v-if="item.use_point < 0" class="badge-get">+{{ Math.abs(item.use_point) }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Staff Dashboard -->
    <template v-if="auth.isStaff">
      <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-700 to-navy-900 p-6 sm:p-8 text-white">
        <div class="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div class="relative">
          <h2 class="font-display text-2xl font-bold mt-0.5">{{ auth.user?.display_name }}</h2>
          <p class="text-navy-400   mt-1">พนักงาน</p>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <router-link to="/staff/customers" class="card text-center hover:shadow-md transition-shadow group">
          <div class="w-12 h-12 mx-auto rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p class="text-sm font-medium text-navy-600 mt-3">ค้นหาสมาชิก</p>
        </router-link>
        <router-link to="/staff/add-points" class="card text-center hover:shadow-md transition-shadow group">
          <div class="w-12 h-12 mx-auto rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <p class="text-sm font-medium text-navy-600 mt-3">เพิ่มแต้ม</p>
        </router-link>
        <router-link to="/staff/use-points" class="card text-center hover:shadow-md transition-shadow group">
          <div class="w-12 h-12 mx-auto rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
          </div>
          <p class="text-sm font-medium text-navy-600 mt-3">ใช้แต้ม</p>
        </router-link>
        <router-link to="/staff/cancel-use" class="card text-center hover:shadow-md transition-shadow group">
          <div class="w-12 h-12 mx-auto rounded-xl bg-red-50 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <p class="text-sm font-medium text-navy-600 mt-3">ยกเลิกใช้แต้ม</p>
        </router-link>
        <router-link to="/staff/point-period" class="card text-center hover:shadow-md transition-shadow group">
          <div class="w-12 h-12 mx-auto rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p class="text-sm font-medium text-navy-600 mt-3">ช่วงวันที่ให้แต้ม</p>
        </router-link>
      </div>

      <!-- Manual process button -->
      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-display font-semibold text-navy-800">คำนวณแต้มด้วยตนเอง</h3>
            <p class="  text-navy-400 mt-0.5">ระบบคำนวณอัตโนมัติทุก 30 นาที</p>
          </div>
          <button @click="processAll" :disabled="processing" class="btn-primary">
            {{ processing ? 'กำลังคำนวณ...' : 'คำนวณเดี๋ยวนี้' }}
          </button>
        </div>
        <div v-if="processResult" class="mt-3 p-3 rounded-xl bg-emerald-50 text-sm text-emerald-700">
          {{ processResult.message || 'ส่งคำสั่งคำนวณแล้ว' }}
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { customerApi, pointApi } from '../api';

const auth = useAuthStore();
const customer = ref(null);
const recentPoints = ref([]);
const processing = ref(false);
const processResult = ref(null);
const creditDetail = ref(null);
const activeCreditTab = ref('docs');
const creditTabs = [
  { key: 'docs', label: 'รายการคงค้าง' },
  { key: 'cheques', label: 'รายการเช็ค' },
  { key: 'srss', label: 'SR/SS' },
];

const formatNumber = (n) => {
  if (n == null) return '0';
  return Number(n).toLocaleString('th-TH');
};

const formatDate = (d) => {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
};

const formatCurrency = (n) => Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 });

const levelInfo = computed(() => {
  const points = Number(customer.value?.reward_point || 0);
  if (points >= 2000) {
    return {
      name: 'PLATINUM',
      bgClass: 'bg-gradient-to-br from-slate-700 via-slate-800 to-black',
    };
  } else if (points >= 800) {
    return {
      name: 'GOLD',
      bgClass: 'bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600',
    };
  } else if (points >= 300) {
    return {
      name: 'SILVER',
      bgClass: 'bg-gradient-to-br from-gray-300 via-gray-400 to-slate-500',
    };
  } else {
    return {
      name: 'COPPER',
      bgClass: 'bg-gradient-to-br from-orange-300 via-orange-400 to-amber-600',
    };
  }
});

onMounted(async () => {
  if (auth.isMember) {
    try {
      const { data } = await customerApi.me();
      customer.value = data.customer;
    } catch {}

    try {
      const { data } = await pointApi.movement({ limit: 5 });
      recentPoints.value = data.data;
    } catch {}

    try {
      const { data } = await customerApi.getCreditDetail(customer.value?.code);
      if (data.success) creditDetail.value = data;
    } catch {}
  }
});

async function processAll() {
  processing.value = true;
  processResult.value = null;
  try {
    const { data } = await pointApi.processAll();
    processResult.value = data;
  } catch {}
  processing.value = false;
}
</script>
