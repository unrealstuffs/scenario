<template>
  <div class="note-card" @click="$emit('select')" :class="{ active }">
    <div class="note-card__header">
      <span class="note-card__title">{{ note.title || "Без названия" }}</span>
      <button
        class="note-card__delete"
        @click.stop="$emit('delete')"
        title="Удалить"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
      </button>
    </div>
    <p class="note-card__preview">{{ preview }}</p>
    <span class="note-card__date">{{ formattedDate }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Note } from "../types";

const props = defineProps<{ note: Note; active: boolean }>();
defineEmits<{
  (e: "select"): void;
  (e: "delete"): void;
}>();

const preview = computed(() => {
  const text = props.note.content.trim();
  return text.length > 100
    ? text.slice(0, 100) + "…"
    : text || "Пустая заметка";
});

const formattedDate = computed(() => {
  const d = new Date(props.note.updatedAt);
  return d.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
});
</script>

<style scoped>
.note-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 14px 16px;
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s,
    transform 0.1s;
  user-select: none;
}

.note-card:hover {
  background: var(--bg-card-hover);
  border-color: var(--border-active);
}

.note-card.active {
  border-color: var(--accent);
  background: var(--bg-card-hover);
}

.note-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}

.note-card__title {
  font-weight: 600;
  font-size: 14px;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.note-card__delete {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  padding: 3px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    color 0.15s,
    background 0.15s;
  flex-shrink: 0;
}

.note-card__delete:hover {
  color: var(--danger-hover);
  background: rgba(231, 76, 60, 0.12);
}

.note-card__preview {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 8px;
}

.note-card__date {
  font-size: 11px;
  color: var(--text-muted);
}
</style>
