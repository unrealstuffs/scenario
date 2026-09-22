<template>
  <div class="auth-locked">
    <!-- Индикатор загрузки -->
    <div v-if="loading" class="auth-loading">
      <i class="pi pi-spin pi-spinner auth-loading__spinner" />
    </div>

    <!-- Сообщение о блокировке и кнопка входа -->
    <div v-else class="locked-msg">
      <i class="pi pi-lock locked-msg__icon" />
      <p>Доступ только для авторизованных</p>
      <button class="btn-signin" @click="$emit('signIn')">
        <i class="pi pi-google" />
        Войти через Google
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  loading?: boolean;
}>();

defineEmits<{
  (e: "signIn"): void;
}>();
</script>

<style scoped>
.auth-locked {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 0;
  padding: 0 40px 40px;
}

@media (max-width: 699px) {
  .auth-locked {
    padding: 0 16px 20px;
  }
}

.auth-loading__spinner {
  font-size: 32px;
  color: var(--text-muted);
}

.locked-msg {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
}

.locked-msg__icon {
  font-size: 52px;
  color: var(--text-primary);
  opacity: 0.5;
}

.locked-msg p {
  font-size: 15px;
  color: var(--text-secondary);
}

.btn-signin {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  padding: 9px 18px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
  font-family: inherit;
}

.btn-signin:hover {
  background: var(--accent-hover);
}
</style>
