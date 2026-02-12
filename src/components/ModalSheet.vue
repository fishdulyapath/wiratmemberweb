<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" @click="$emit('close')"></div>
        <div class="relative bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[85vh] flex flex-col shadow-2xl">
          <!-- Header -->
          <div class="flex items-center justify-between p-5 border-b border-navy-100">
            <div>
              <h3 class="font-display font-semibold text-navy-800">{{ title }}</h3>
              <p class="text-xs text-navy-400 mt-0.5">{{ subtitle }}</p>
            </div>
            <button @click="$emit('close')" class="p-2 rounded-lg hover:bg-navy-50 text-navy-400 transition-colors">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div class="flex-1 overflow-y-auto p-5">
            <div v-if="loading" class="flex items-center justify-center py-12">
              <svg class="animate-spin h-8 w-8 text-brand-500" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
            </div>
            <slot v-else></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({
  show: Boolean,
  title: String,
  subtitle: String,
  loading: Boolean,
});
defineEmits(['close']);
</script>

<style scoped>
.modal-enter-active, .modal-leave-active {
  transition: all 0.3s ease;
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
}
.modal-enter-from .relative, .modal-leave-to .relative {
  transform: translateY(20px);
}
</style>
