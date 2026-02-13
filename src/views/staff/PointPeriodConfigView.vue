<template>
  <div class="space-y-4">
    <h1 class="font-display text-xl font-bold text-navy-800">กำหนดช่วงวันที่ให้แต้ม</h1>

    <!-- ฟอร์มเพิ่ม period ใหม่ -->
    <div class="card space-y-4">
      <h2 class="font-display font-semibold text-navy-700">เพิ่มช่วงวันที่ใหม่</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block text-sm font-medium text-navy-600 mb-1.5">วันที่เริ่มต้น</label>
          <input v-model="form.start_date" type="date" class="input-field">
        </div>
        <div>
          <label class="block text-sm font-medium text-navy-600 mb-1.5">วันที่สิ้นสุด</label>
          <input v-model="form.end_date" type="date" class="input-field">
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium text-navy-600 mb-1.5">หมายเหตุ</label>
        <input v-model="form.remark" type="text" class="input-field" placeholder="เช่น แต้มประจำปี 2026">
      </div>
      <button @click="createPeriod" :disabled="!form.start_date || !form.end_date || submitting" class="btn-primary w-full sm:w-auto">
        {{ submitting ? 'กำลังบันทึก...' : 'เพิ่มช่วงวันที่' }}
      </button>

      <div v-if="successMsg" class="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-sm text-emerald-700">{{ successMsg }}</div>
      <div v-if="error" class="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">{{ error }}</div>
    </div>

    <!-- รายการ period ที่มีอยู่ -->
    <div class="card">
      <h2 class="font-display font-semibold text-navy-700 mb-4">ช่วงวันที่ทั้งหมด</h2>

      <div v-if="loading" class="text-center py-8 text-navy-400 text-sm">กำลังโหลด...</div>

      <div v-else-if="periods.length === 0" class="text-center py-8 text-navy-400 text-sm">
        ยังไม่มีช่วงวันที่ กรุณาเพิ่มช่วงวันที่ด้านบน
      </div>

      <div v-else class="space-y-3">
        <div v-for="period in periods" :key="period.id"
          class="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-colors"
          :class="period.is_active ? 'border-emerald-200 bg-emerald-50/50' : 'border-navy-100 bg-navy-50/30'">

          <!-- ข้อมูล period -->
          <div class="flex-1 min-w-0">
            <!-- แก้ไข mode -->
            <template v-if="editing === period.id">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                <input v-model="editForm.start_date" type="date" class="input-field text-sm">
                <input v-model="editForm.end_date" type="date" class="input-field text-sm">
              </div>
              <input v-model="editForm.remark" type="text" class="input-field text-sm" placeholder="หมายเหตุ">
            </template>
            <!-- แสดงข้อมูลปกติ -->
            <template v-else>
              <p class="text-sm font-medium text-navy-700">
                {{ formatDate(period.start_date) }} — {{ formatDate(period.end_date) }}
              </p>
              <p v-if="period.remark" class="  text-navy-400 mt-0.5">{{ period.remark }}</p>
              <p class="  text-navy-400 mt-0.5">
                สร้างโดย: {{ period.created_by || '-' }}
              </p>
            </template>
          </div>

          <!-- ปุ่มจัดการ -->
          <div class="flex items-center gap-2 mt-3 sm:mt-0 sm:ml-4">
            <template v-if="editing === period.id">
              <button @click="saveEdit(period.id)" class="btn-primary   px-3 py-1.5">บันทึก</button>
              <button @click="editing = null" class="btn-secondary   px-3 py-1.5">ยกเลิก</button>
            </template>
            <template v-else>
              <button @click="toggleActive(period)" class="  px-3 py-1.5 rounded-lg font-medium transition-colors"
                :class="period.is_active ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-navy-100 text-navy-500 hover:bg-navy-200'">
                {{ period.is_active ? 'เปิดใช้' : 'ปิดใช้' }}
              </button>
              <button @click="startEdit(period)" class="btn-secondary   px-3 py-1.5">แก้ไข</button>
              <button @click="deletePeriod(period.id)" class="btn-danger   px-3 py-1.5">ลบ</button>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { pointConfigApi } from '../../api';

const periods = ref([]);
const loading = ref(true);
const submitting = ref(false);
const successMsg = ref('');
const error = ref('');
const editing = ref(null);

const form = ref({ start_date: '', end_date: '', remark: '' });
const editForm = ref({ start_date: '', end_date: '', remark: '' });

const formatDate = (d) => {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
};

async function fetchPeriods() {
  loading.value = true;
  try {
    const { data } = await pointConfigApi.list();
    periods.value = data.periods;
  } catch {}
  loading.value = false;
}

async function createPeriod() {
  error.value = '';
  successMsg.value = '';
  submitting.value = true;
  try {
    await pointConfigApi.create({
      start_date: form.value.start_date,
      end_date: form.value.end_date,
      remark: form.value.remark || undefined,
    });
    successMsg.value = 'เพิ่มช่วงวันที่สำเร็จ';
    form.value = { start_date: '', end_date: '', remark: '' };
    await fetchPeriods();
  } catch (err) {
    error.value = err.response?.data?.error || 'เกิดข้อผิดพลาด';
  }
  submitting.value = false;
}

function startEdit(period) {
  editing.value = period.id;
  editForm.value = {
    start_date: period.start_date?.slice(0, 10) || '',
    end_date: period.end_date?.slice(0, 10) || '',
    remark: period.remark || '',
  };
}

async function saveEdit(id) {
  try {
    await pointConfigApi.update(id, {
      start_date: editForm.value.start_date,
      end_date: editForm.value.end_date,
      remark: editForm.value.remark,
    });
    editing.value = null;
    await fetchPeriods();
  } catch (err) {
    error.value = err.response?.data?.error || 'เกิดข้อผิดพลาด';
  }
}

async function toggleActive(period) {
  try {
    await pointConfigApi.update(period.id, { is_active: !period.is_active });
    await fetchPeriods();
  } catch {}
}

async function deletePeriod(id) {
  if (!confirm('ต้องการลบช่วงวันที่นี้?')) return;
  try {
    await pointConfigApi.remove(id);
    await fetchPeriods();
  } catch {}
}

onMounted(fetchPeriods);
</script>
