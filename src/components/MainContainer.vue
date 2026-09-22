<template>
  <main class="main">
    <img
      v-if="note"
      src="../assets/losyash.png"
      alt="Losyash"
      class="losyash"
    />
    <NoteEditor
      v-if="note"
      :note="note"
      :is-mobile="false"
      @close="$emit('close')"
      @save="(title, content) => $emit('save', title, content)"
    />

    <div v-else class="main__placeholder">
      <i class="pi pi-file-edit main__placeholder-icon" />
      <p>
        Выберите материал или<br />
        создайте новый
      </p>
      <button class="btn-create" @click="$emit('create')">
        <img :src="romashkaSrc" alt="" class="btn-romashka" />
        Новый материал
      </button>
    </div>
  </main>
</template>

<script setup lang="ts">
import type { Note } from "../types";
import NoteEditor from "./NoteEditor.vue";

defineProps<{
  note?: Note;
}>();

defineEmits<{
  (e: "close"): void;
  (e: "save", title: string, content: string): void;
  (e: "create"): void;
}>();

const romashkaSrc = new URL("/assets/images/romashka.svg", import.meta.url)
  .href;
</script>

<style scoped>
.losyash {
  position: absolute;
  top: -115px;
  right: 10%;
  z-index: 1;
  width: 300px;
}
.main {
  flex: 1;
  /* overflow: hidden; */
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  position: relative;
}

.main__placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: var(--text-muted);
  text-align: center;
}

.main__placeholder-icon {
  font-size: 60px;
  opacity: 0.3;
  color: var(--text-primary);
}

.main__placeholder p {
  font-size: 15px;
  line-height: 1.6;
  color: var(--text-primary);
}

.btn-create {
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

.btn-create:hover {
  background: var(--accent-hover);
}

.btn-romashka {
  width: 34px;
  height: 34px;
  object-fit: contain;
  flex-shrink: 0;
}
</style>
