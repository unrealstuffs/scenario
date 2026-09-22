<template>
  <div class="app-wrapper">
    <AppHeader />

    <!-- Декоративные уши: позиционируются за сайдбаром, перекрывая хедер -->

    <!-- Состояния авторизации: загрузка или блокировка -->
    <AuthLocked
      v-if="authLoading || !currentUser"
      :loading="authLoading"
      @signIn="signInWithGoogle"
    />

    <!-- Рабочая область авторизованного пользователя -->
    <div v-else class="app">
      <Sidebar
        :notes="notes"
        :active-note-id="activeNoteId"
        :is-mobile="isMobile"
        :is-note-open="Boolean(activeNote)"
        @create="createAndOpen"
        @select="openNote"
        @delete="removeNote"
      />

      <!-- Десктопная рабочая область -->
      <MainContainer
        v-if="!isMobile"
        :note="activeNote"
        @close="activeNoteId = null"
        @save="handleSave"
        @create="createAndOpen"
      />

      <!-- Мобильная шторка с редактором -->
      <MobileNoteModal
        :is-open="isMobile && Boolean(activeNote)"
        :note="activeNote"
        @close="activeNoteId = null"
        @save="handleSave"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import AppHeader from "./components/Header.vue";
import AuthLocked from "./components/AuthLocked.vue";
import Sidebar from "./components/Sidebar.vue";
import MainContainer from "./components/MainContainer.vue";
import MobileNoteModal from "./components/MobileNoteModal.vue";
import { useNotes } from "./useNotes";
import { useMobile } from "./composables/useMobile";
import { currentUser, authLoading, signInWithGoogle } from "./firebase/auth";

const { notes, createNote, updateNote, deleteNote, getNoteById } = useNotes();
const { isMobile } = useMobile();

const activeNoteId = ref<string | null>(null);

const activeNote = computed(() =>
  activeNoteId.value ? getNoteById(activeNoteId.value) : undefined,
);

function openNote(id: string) {
  activeNoteId.value = id;
}

function createAndOpen() {
  const note = createNote();
  activeNoteId.value = note.id;
}

function removeNote(id: string) {
  if (activeNoteId.value === id) {
    activeNoteId.value = null;
  }
  deleteNote(id);
}

function handleSave(title: string, content: string) {
  if (activeNoteId.value) {
    updateNote(activeNoteId.value, { title, content });
  }
}
</script>

<style scoped>
/* ── Root wrapper: header + content ─────── */
.app-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  /* overflow: hidden; */
  background-image: url(./assets/bg.jpg);
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  position: relative;
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
  /* overflow: hidden; */
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
</style>
