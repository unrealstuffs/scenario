<template>
  <aside class="sidebar" :class="{ 'sidebar--hidden': isMobile && isNoteOpen }">
    <img src="../assets/ears.png" class="ears" alt="Krosh" aria-hidden="true" />
    <img
      src="../assets/barash.png"
      class="barash"
      alt="Barash"
      aria-hidden="true"
    />
    <!-- Header -->
    <div class="sidebar__header">
      <h1 class="sidebar__logo">Материалы</h1>
      <button
        class="sidebar__new-btn"
        @click="$emit('create')"
        title="Новый материал"
      >
        <img :src="romashkaSrc" alt="Создать" class="btn-romashka" />
      </button>
    </div>

    <!-- Search -->
    <div class="sidebar__search-wrap">
      <i class="pi pi-search sidebar__search-icon" />
      <input
        class="sidebar__search"
        v-model="searchQuery"
        placeholder="Поиск материалов..."
      />
    </div>

    <!-- Notes list -->
    <div class="sidebar__list">
      <template v-if="filteredNotes.length > 0">
        <NoteCard
          v-for="note in filteredNotes"
          :key="note.id"
          :note="note"
          :active="activeNoteId === note.id"
          @select="$emit('select', note.id)"
          @delete="$emit('delete', note.id)"
        />
      </template>
      <div v-else class="sidebar__empty">
        <i class="pi pi-file sidebar__empty-icon" />
        <p>{{ searchQuery ? "Ничего не найдено" : "Нет материалов" }}</p>
      </div>
    </div>

    <!-- Footer count -->
    <div class="sidebar__footer">{{ notes.length }} {{ countLabel }}</div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import type { Note } from "../types";
import NoteCard from "./NoteCard.vue";
import { pluralize } from "../utils/pluralize";

const props = defineProps<{
  notes: Note[];
  activeNoteId: string | null;
  isMobile?: boolean;
  isNoteOpen?: boolean;
}>();

defineEmits<{
  (e: "create"): void;
  (e: "select", id: string): void;
  (e: "delete", id: string): void;
}>();

const romashkaSrc = new URL("/assets/images/romashka.svg", import.meta.url)
  .href;
const searchQuery = ref("");

const filteredNotes = computed(() => {
  const q = searchQuery.value.toLowerCase().trim();
  if (!q) return props.notes;
  return props.notes.filter(
    (n) =>
      n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q),
  );
});

const countLabel = computed(() =>
  pluralize(props.notes.length, ["материал", "материала", "материалов"]),
);
</script>

<style scoped>
.sidebar {
  width: 300px;
  min-width: 260px;
  background: var(--bg-secondary);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  transition:
    width 0.25s,
    min-width 0.25s;
  position: relative;
  z-index: 3; /* выше ears (1) */
}

@media (max-width: 699px) {
  .sidebar {
    width: 100%;
    min-width: 0;
    border-radius: 0;
    border-right: none;
  }
}

.ears {
  position: absolute;
  width: 110px;
  top: -102px;
  left: 160px;
}

.barash {
  position: absolute;
  width: 85px;
  bottom: -10px;
  left: 15px;
}

@media (max-width: 699px) {
  .ears {
    right: 0;
    left: auto;
  }
}

.sidebar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 16px 14px;
  flex-shrink: 0;
}

.sidebar__logo {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}

.sidebar__new-btn {
  background: var(--accent);
  border: none;
  border-radius: var(--radius-sm);
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    background 0.15s,
    transform 0.1s;
  padding: 6px;
}
.sidebar__new-btn:hover {
  background: var(--accent-hover);
  transform: scale(1.05);
}
.sidebar__new-btn:active {
  transform: scale(0.95);
}

/* Romashka image inside buttons */
.btn-romashka {
  width: 34px;
  height: 34px;
  object-fit: contain;
  flex-shrink: 0;
}

.sidebar__search-wrap {
  position: relative;
  margin: 0 12px 10px;
  flex-shrink: 0;
}
.sidebar__search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
  font-size: 13px;
}
.sidebar__search {
  width: 100%;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 8px 10px 8px 30px;
  font-size: 13px;
  color: var(--text-primary);
  outline: none;
  transition: border-color 0.15s;
  font-family: inherit;
}
.sidebar__search:focus {
  border-color: var(--accent);
}
.sidebar__search::placeholder {
  color: var(--text-muted);
}

.sidebar__list {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
  display: flex;
  flex-direction: column;
}

.sidebar__empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 20px;
  color: var(--text-muted);
  text-align: center;
}
.sidebar__empty-icon {
  font-size: 40px;
  opacity: 0.4;
}
.sidebar__empty p {
  font-size: 13px;
}

.sidebar__footer {
  padding: 10px 16px;
  font-size: 11px;
  color: var(--text-muted);
  border-top: 1px solid var(--border);
  text-align: center;
  flex-shrink: 0;
}
</style>
