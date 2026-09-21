<template>
  <div class="app">
    <!-- Sidebar -->
    <aside
      class="sidebar"
      :class="{ 'sidebar--hidden': isMobile && activeNote }"
    >
      <div class="sidebar__header">
        <h1 class="sidebar__logo">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
            />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          Заметки
        </h1>
        <button
          class="sidebar__new-btn"
          @click="createAndOpen"
          title="Новая заметка"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      <!-- Search -->
      <div class="sidebar__search-wrap">
        <svg
          class="sidebar__search-icon"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          class="sidebar__search"
          v-model="searchQuery"
          placeholder="Поиск заметок…"
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
            @select="openNote(note.id)"
            @delete="removeNote(note.id)"
          />
        </template>
        <div v-else class="sidebar__empty">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
            />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <p>{{ searchQuery ? "Ничего не найдено" : "Нет заметок" }}</p>
          <button v-if="!searchQuery" class="btn-create" @click="createAndOpen">
            Создать первую
          </button>
        </div>
      </div>

      <!-- Footer count -->
      <div class="sidebar__footer">
        {{ notes.length }} {{ pluralNotes(notes.length) }}
      </div>
    </aside>

    <!-- Desktop: main area (shown alongside sidebar) -->
    <main v-if="!isMobile" class="main">
      <NoteEditor
        v-if="activeNote"
        :note="activeNote"
        :is-mobile="false"
        @close="activeNoteId = null"
        @save="
          (title, content) => updateNote(activeNoteId!, { title, content })
        "
      />
      <div v-else class="main__placeholder">
        <svg
          width="60"
          height="60"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path
            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
          />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        <p>Выберите заметку или<br />создайте новую</p>
        <button class="btn-create" @click="createAndOpen">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Новая заметка
        </button>
      </div>
    </main>

    <!-- Mobile: modal overlay -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="isMobile && activeNote"
          class="modal-overlay"
          @click.self="activeNoteId = null"
        >
          <div class="modal-sheet">
            <NoteEditor
              :note="activeNote"
              :is-mobile="true"
              @close="activeNoteId = null"
              @save="
                (title, content) =>
                  updateNote(activeNoteId!, { title, content })
              "
            />
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import NoteCard from "./components/NoteCard.vue";
import NoteEditor from "./components/NoteEditor.vue";
import { useNotes } from "./useNotes";

const { notes, createNote, updateNote, deleteNote, getNoteById } = useNotes();

const activeNoteId = ref<string | null>(null);
const searchQuery = ref("");
const isMobile = ref(false);

function checkMobile() {
  isMobile.value = window.innerWidth < 700;
}
onMounted(() => {
  checkMobile();
  window.addEventListener("resize", checkMobile);
});
onUnmounted(() => window.removeEventListener("resize", checkMobile));

const activeNote = computed(() =>
  activeNoteId.value ? getNoteById(activeNoteId.value) : undefined,
);

const filteredNotes = computed(() => {
  const q = searchQuery.value.toLowerCase().trim();
  if (!q) return notes.value;
  return notes.value.filter(
    (n) =>
      n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q),
  );
});

function openNote(id: string) {
  activeNoteId.value = id;
}

function createAndOpen() {
  const note = createNote();
  activeNoteId.value = note.id;
}

function removeNote(id: string) {
  if (activeNoteId.value === id) activeNoteId.value = null;
  deleteNote(id);
}

function pluralNotes(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "заметка";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20))
    return "заметки";
  return "заметок";
}
</script>

<style scoped>
.app {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* ── Sidebar ─────────────────────────────── */
.sidebar {
  width: 300px;
  min-width: 260px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition:
    width 0.25s,
    min-width 0.25s;
}

/* On mobile the sidebar takes full width */
@media (max-width: 699px) {
  .sidebar {
    width: 100%;
    min-width: 0;
    border-right: none;
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
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}

.sidebar__new-btn {
  background: var(--accent);
  border: none;
  border-radius: var(--radius-sm);
  color: #fff;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    background 0.15s,
    transform 0.1s;
}
.sidebar__new-btn:hover {
  background: var(--accent-hover);
  transform: scale(1.05);
}
.sidebar__new-btn:active {
  transform: scale(0.95);
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
  padding: 4px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
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

/* ── Desktop Main ────────────────────────── */
.main {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
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
.main__placeholder p {
  font-size: 15px;
  line-height: 1.6;
}

/* ── Mobile Modal ────────────────────────── */
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

/* Modal transition */
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
.modal-enter-from {
  opacity: 0;
  transform: translateY(100%);
}
.modal-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

/* ── Shared button ───────────────────────── */
.btn-create {
  display: flex;
  align-items: center;
  gap: 6px;
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
</style>
