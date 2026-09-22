<template>
  <div class="app-wrapper">
    <AppHeader />

    <!-- Ears: positioned behind sidebar, overlapping header -->
    <img
      v-if="currentUser"
      :src="earsSrc"
      class="ears"
      alt=""
      aria-hidden="true"
    />

    <!-- Not authenticated -->
    <div v-if="!authLoading && !currentUser" class="app app--locked">
      <div class="locked-msg">
        <i class="pi pi-lock locked-msg__icon" />
        <p>Доступ только для авторизованных</p>
        <button class="btn-create" @click="signInWithGoogle">
          <i class="pi pi-google" />
          Войти через Google
        </button>
      </div>
    </div>

    <!-- Loading auth state -->
    <div v-else-if="authLoading" class="app app--locked">
      <i
        class="pi pi-spin pi-spinner"
        style="font-size: 32px; color: var(--text-muted)"
      />
    </div>

    <!-- Authenticated -->
    <div v-else class="app">
      <!-- Sidebar -->
      <aside
        class="sidebar"
        :class="{ 'sidebar--hidden': isMobile && activeNote }"
      >
        <div class="sidebar__header">
          <h1 class="sidebar__logo">Материалы</h1>
          <button
            class="sidebar__new-btn"
            @click="createAndOpen"
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
              @select="openNote(note.id)"
              @delete="removeNote(note.id)"
            />
          </template>
          <div v-else class="sidebar__empty">
            <i class="pi pi-file sidebar__empty-icon" />
            <p>{{ searchQuery ? "Ничего не найдено" : "Нет материалов" }}</p>
          </div>
        </div>

        <!-- Footer count -->
        <div class="sidebar__footer">
          {{ notes.length }} {{ pluralNotes(notes.length) }}
        </div>
      </aside>

      <!-- Desktop: main area -->
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
          <i class="pi pi-file-edit main__placeholder-icon" />
          <p>Выберите материал или<br />создайте новый</p>
          <button class="btn-create" @click="createAndOpen">
            <img :src="romashkaSrc" alt="" class="btn-romashka" />
            Новый материал
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import AppHeader from "./components/Header.vue";
import NoteCard from "./components/NoteCard.vue";
import NoteEditor from "./components/NoteEditor.vue";
import { useNotes } from "./useNotes";
import { currentUser, authLoading, signInWithGoogle } from "./firebase/auth";

// Файлы из public/ — используем import напрямую (Vite копирует их as-is)
const romashkaSrc = new URL("/assets/images/romashka.svg", import.meta.url)
  .href;
const earsSrc = new URL("/assets/images/ears.png", import.meta.url).href;

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
  if (mod10 === 1 && mod100 !== 11) return "матриал";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20))
    return "материала";
  return "материалов";
}
</script>

<style scoped>
/* ── Root wrapper: header + content ─────── */
.app-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background-image: url(./assets/bg.jpg);
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  position: relative; /* для абсолютного позиционирования ears */
}

/* ── Ears image: behind sidebar, overlapping header ── */
.ears {
  position: absolute;
  top: -1%; /* начинается от самого верха, перекрывая хедер */
  left: 8%; /* прижата к левому краю где сайдбар */
  width: 250px;
  pointer-events: none;
  z-index: 2; /* выше хедера (0), ниже сайдбара (2) */
}

@media (max-width: 699px) {
  .ears {
    left: 55%;
    width: 300px;
    top: -5%;
  }
}

@media (max-width: 480px) {
  .ears {
    left: 30%;
    width: 300px;
    top: -5%;
  }
}

/* ── Content area below header ───────────── */
.app {
  flex: 1;
  display: flex;
  overflow: hidden;
  padding: 0 40px 40px;
  gap: 40px;
  min-height: 0;
}

@media (max-width: 699px) {
  .app {
    padding: 0;
    gap: 0;
  }
}

/* ── Sidebar ─────────────────────────────── */
.sidebar {
  width: 300px;
  min-width: 260px;
  background: var(--bg-secondary);
  background-image: url(./assets/barash.png);
  background-position: -5% 93%;
  background-size: 50%;
  background-repeat: no-repeat;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
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

/* ── Desktop Main ────────────────────────── */
.main {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
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

/* ── Shared button ───────────────────────── */
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

/* ── Locked / Loading screen ─────────────── */
.app--locked {
  justify-content: center;
  align-items: center;
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
  color: var(--text-muted);
  opacity: 0.5;
}

.locked-msg p {
  font-size: 15px;
  color: var(--text-secondary);
}
</style>
