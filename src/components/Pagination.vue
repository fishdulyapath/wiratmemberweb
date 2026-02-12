<template>
  <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-4">
    <button @click="$emit('change', page - 1)" :disabled="page <= 1"
      class="p-2 rounded-lg text-navy-400 hover:bg-navy-100 disabled:opacity-30 transition-colors">
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
    <span class="text-sm text-navy-500 px-3">หน้า {{ page }} / {{ totalPages }}</span>
    <button @click="$emit('change', page + 1)" :disabled="page >= totalPages"
      class="p-2 rounded-lg text-navy-400 hover:bg-navy-100 disabled:opacity-30 transition-colors">
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  </div>
</template>

<script setup>
defineProps({ page: Number, totalPages: Number });
defineEmits(['change']);
</script>
