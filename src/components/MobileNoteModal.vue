<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen && note"
        class="modal-overlay"
        @click.self="$emit('close')"
      >
        <div class="modal-sheet">
          <NoteEditor
            :note="note"
            :is-mobile="true"
            @close="$emit('close')"
            @save="(title, content) => $emit('save', title, content)"
          />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { Note } from "../types";
import NoteEditor from "./NoteEditor.vue";

defineProps<{
  note?: Note;
  isOpen: boolean;
}>();

defineEmits<{
  (e: "close"): void;
  (e: "save", title: string, content: string): void;
}>();
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 100;
  display: flex;
  align-items: flex-end;
}

.modal-sheet {
  width: 100%;
  height: 95dvh;
  background: var(--bg-secondary);
  border-radius: 18px 18px 0 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-enter-active {
  transition:
    opacity 0.2s,
    transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-leave-active {
  transition:
    opacity 0.18s,
    transform 0.18s ease-in;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: translateY(100%);
}
</style>
