<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="isOpen"
        class="modal-backdrop"
        @click.self="$emit('cancel')"
        @keydown.esc="$emit('cancel')"
        tabindex="-1"
      >
        <div class="modal-dialog" role="dialog" aria-modal="true">
          <div class="modal-dialog__header">
            <i
              class="pi pi-exclamation-triangle modal-dialog__icon"
              :class="{ 'modal-dialog__icon--danger': danger }"
            />
            <h3 class="modal-dialog__title">{{ title }}</h3>
          </div>

          <p v-if="message" class="modal-dialog__message">{{ message }}</p>

          <div class="modal-dialog__actions">
            <button
              type="button"
              class="btn btn--secondary"
              @click="$emit('cancel')"
            >
              {{ cancelText }}
            </button>
            <button
              type="button"
              class="btn"
              :class="danger ? 'btn--danger' : 'btn--primary'"
              @click="$emit('confirm')"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    isOpen: boolean;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    danger?: boolean;
  }>(),
  {
    title: "Удалить материал?",
    message: "Вы уверены? Это действие нельзя будет отменить.",
    confirmText: "Удалить",
    cancelText: "Отмена",
    danger: true,
  },
);

defineEmits<{
  (e: "confirm"): void;
  (e: "cancel"): void;
}>();
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
  backdrop-filter: blur(2px);
}

.modal-dialog {
  background: var(--bg-secondary);
  border: 1px solid var(--border-active);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  width: 100%;
  max-width: 360px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.modal-dialog__header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-dialog__icon {
  font-size: 20px;
  color: var(--accent);
}

.modal-dialog__icon--danger {
  color: var(--danger-hover);
}

.modal-dialog__title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.modal-dialog__message {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

.modal-dialog__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 4px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 7px 14px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;
  font-family: inherit;
}

.btn--secondary {
  background: var(--bg-card);
  color: var(--text-secondary);
  border: 1px solid var(--border);
}

.btn--secondary:hover {
  background: var(--bg-card-hover);
  color: var(--text-primary);
}

.btn--danger {
  background: var(--danger);
  color: #fff;
}

.btn--danger:hover {
  background: var(--danger-hover);
}

.btn--primary {
  background: var(--accent);
  color: #fff;
}

.btn--primary:hover {
  background: var(--accent-hover);
}

/* Transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .modal-dialog,
.modal-fade-leave-to .modal-dialog {
  transform: scale(0.95);
}
</style>
