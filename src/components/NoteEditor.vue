<template>
  <div class="editor">
    <!-- Header -->
    <div class="editor__header">
      <button v-if="isMobile" class="btn btn--back" @click="handleClose">
        <i class="pi pi-angle-left" />
      </button>
      <input
        class="editor__title-input"
        v-model="localTitle"
        placeholder="Название материала..."
        @input="onTitleInput"
        maxlength="100"
      />
      <div class="editor__actions">
        <!-- Autosave indicator -->
        <Transition name="fade">
          <span v-if="saveStatus === 'saving'" class="save-indicator saving">
            <i class="pi pi-spin pi-spinner" />
            Сохраняется…
          </span>
          <span v-else-if="saveStatus === 'saved'" class="save-indicator saved">
            <i class="pi pi-check" />
            Сохранено
          </span>
        </Transition>
        <button v-if="!isMobile" class="btn btn--close" @click="handleClose">
          <i class="pi pi-times" />
          Закрыть
        </button>
      </div>
    </div>

    <!-- Body with textarea and transparent watermark -->
    <div class="editor__body">
      <textarea
        class="editor__textarea"
        v-model="localContent"
        placeholder="Начните писать…"
        @input="onContentInput"
      />
      <img
        :src="kgbWatermark"
        alt=""
        class="editor__watermark"
        aria-hidden="true"
      />
    </div>

    <!-- Stats footer -->
    <EditorFooter :content="localContent" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from "vue";
import type { Note } from "../types";
import EditorFooter from "./EditorFooter.vue";

const props = defineProps<{
  note: Note;
  isMobile: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "save", title: string, content: string): void;
}>();

const kgbWatermark = new URL("/assets/images/kgb.png", import.meta.url).href;

const localTitle = ref(props.note.title);
const localContent = ref(props.note.content);
const saveStatus = ref<"" | "saving" | "saved">("");

let saveTimer: ReturnType<typeof setTimeout>;

function flushSave() {
  if (saveStatus.value === "saving") {
    clearTimeout(saveTimer);
    emit("save", localTitle.value, localContent.value);
    saveStatus.value = "";
  }
}

function handleClose() {
  flushSave();
  emit("close");
}

onBeforeUnmount(() => {
  flushSave();
});

watch(
  () => props.note,
  (newNote, oldNote) => {
    if (oldNote && oldNote.id !== newNote.id) {
      flushSave();
    }
    localTitle.value = newNote.title;
    localContent.value = newNote.content;
  },
);

function scheduleAutosave() {
  clearTimeout(saveTimer);
  saveStatus.value = "saving";
  saveTimer = setTimeout(() => {
    emit("save", localTitle.value, localContent.value);
    saveStatus.value = "saved";
    setTimeout(() => {
      saveStatus.value = "";
    }, 1800);
  }, 800);
}

function onTitleInput() {
  scheduleAutosave();
}

function onContentInput() {
  scheduleAutosave();
}
</script>

<style scoped>
.editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-secondary);
  position: relative;
  border-radius: 12px;
}

.editor__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.editor__title-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  font-size: 17px;
  font-weight: 700;
  color: var(--text-primary);
  min-width: 0;
  font-family: inherit;
}

.editor__title-input::placeholder {
  color: var(--text-muted);
}

.editor__actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

/* Save indicator */
.save-indicator {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  white-space: nowrap;
}

.save-indicator.saving {
  color: var(--text-muted);
}

.save-indicator.saved {
  color: var(--success);
}

/* Buttons */
.btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 13px;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;
  font-family: inherit;
  white-space: nowrap;
}

.btn--close {
  background: var(--bg-card);
  color: var(--text-secondary);
  border: 1px solid var(--border);
}

.btn--close:hover {
  background: var(--bg-card-hover);
  color: var(--text-primary);
}

.btn--back {
  padding: 7px 10px;
  border: none;
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: 16px;
}

.btn--back:hover {
  color: var(--text-primary);
}

/* Body & Textarea */
.editor__body {
  flex: 1;
  position: relative;
  display: flex;
  min-height: 0;
  overflow: hidden;
}

.editor__textarea {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  resize: none;
  padding: 20px 22px;
  font-size: 15px;
  line-height: 1.75;
  color: var(--text-primary);
  font-family: inherit;
  position: relative;
  z-index: 1;
}

.editor__textarea::placeholder {
  color: var(--text-muted);
}

/* KGB Watermark: 30% opacity */
.editor__watermark {
  position: absolute;
  right: 0;
  bottom: 18px;
  width: 90px;
  height: 90px;
  object-fit: contain;
  opacity: 0.3;
  pointer-events: none;
  z-index: 0;
  user-select: none;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
