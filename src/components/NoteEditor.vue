<template>
  <div class="editor">
    <!-- Header -->
    <div class="editor__header">
      <button v-if="isMobile" class="btn btn--back" @click="$emit('close')">
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
        <button v-if="!isMobile" class="btn btn--close" @click="$emit('close')">
          <i class="pi pi-times" />
          Закрыть
        </button>
      </div>
    </div>

    <!-- Textarea -->
    <textarea
      class="editor__textarea"
      v-model="localContent"
      placeholder="Начните писать…"
      @input="onContentInput"
    />

    <!-- Stats footer -->
    <div class="editor__footer">
      <div class="editor__stats">
        <span class="stat">
          <i class="pi pi-align-left" />
          Симв: <strong>{{ charCount }}</strong>
        </span>
        <span class="stat">
          <i class="pi pi-comment" />
          Слов: <strong>{{ wordCount }}</strong>
        </span>
        <span class="stat stat--duration" :title="`Скорость: ${wpm} слов/мин`">
          <i class="pi pi-clock" />
          <span>{{ duration }}</span>
          <button
            class="wpm-btn"
            @click.stop="showWpmInput = !showWpmInput"
            title="Изменить скорость речи"
          >
            <i class="pi pi-pencil" />
          </button>
          <!-- WPM inline editor -->
          <Transition name="pop">
            <div v-if="showWpmInput" class="wpm-popup" @click.stop>
              <label class="wpm-popup__label">Слов в минуту</label>
              <div class="wpm-popup__row">
                <input
                  class="wpm-popup__input"
                  type="number"
                  v-model.number="wpmDraft"
                  min="1"
                  max="1000"
                  @keydown.enter="applyWpm"
                  @keydown.esc="showWpmInput = false"
                  ref="wpmInputRef"
                />
                <button class="wpm-popup__apply" @click="applyWpm">ОК</button>
              </div>
              <span class="wpm-popup__hint">По умолчанию: 168 (2.8 сл/с)</span>
            </div>
          </Transition>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";
import type { Note } from "../types";

const props = defineProps<{
  note: Note;
  isMobile: boolean;
}>();
const emit = defineEmits<{
  (e: "close"): void;
  (e: "save", title: string, content: string): void;
}>();

const localTitle = ref(props.note.title);
const localContent = ref(props.note.content);

const saveStatus = ref<"" | "saving" | "saved">("");

const WPM_KEY = "notes-wpm";
const wpm = ref<number>(Number(localStorage.getItem(WPM_KEY)) || 168);
const showWpmInput = ref(false);
const wpmDraft = ref(wpm.value);
const wpmInputRef = ref<HTMLInputElement | null>(null);

watch(showWpmInput, async (v) => {
  if (v) {
    wpmDraft.value = wpm.value;
    await nextTick();
    wpmInputRef.value?.focus();
    wpmInputRef.value?.select();
  }
});

function applyWpm() {
  const val = Math.max(1, Math.min(1000, wpmDraft.value || 168));
  wpm.value = val;
  localStorage.setItem(WPM_KEY, String(val));
  showWpmInput.value = false;
}

watch(
  () => props.note,
  (n) => {
    localTitle.value = n.title;
    localContent.value = n.content;
  },
);

const charCount = computed(() => localContent.value.replace(/\s/g, "").length);
const wordCount = computed(() => {
  const trimmed = localContent.value.trim();
  return trimmed === "" ? 0 : trimmed.split(/\s+/).length;
});

const duration = computed(() => {
  const totalSec = Math.round((wordCount.value / wpm.value) * 60);
  const mm = Math.floor(totalSec / 60)
    .toString()
    .padStart(2, "0");
  const ss = (totalSec % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
});

let saveTimer: ReturnType<typeof setTimeout>;

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

/* Textarea */
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
  background-image: url(/assets/images/kgb.png);
  background-repeat: no-repeat;
  background-size: 4%;
  background-position: 98% 98%;
}
.editor__textarea::placeholder {
  color: var(--text-muted);
}

/* Footer */
.editor__footer {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}

.editor__stats {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.stat {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--text-secondary);
  position: relative;
}
.stat .pi {
  font-size: 12px;
}
.stat strong {
  color: var(--text-primary);
}

.stat--duration {
  gap: 4px;
}

.wpm-btn {
  background: none;
  border: none;
  padding: 2px 3px;
  cursor: pointer;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  border-radius: 3px;
  transition: color 0.15s;
  font-size: 11px;
}
.wpm-btn:hover {
  color: var(--accent);
}

/* WPM popup */
.wpm-popup {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  background: var(--bg-card);
  border: 1px solid var(--border-active);
  border-radius: var(--radius);
  padding: 12px 14px;
  z-index: 50;
  box-shadow: var(--shadow);
  min-width: 200px;
}
.wpm-popup__label {
  display: block;
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.wpm-popup__row {
  display: flex;
  gap: 6px;
}
.wpm-popup__input {
  flex: 1;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  padding: 6px 8px;
  font-size: 14px;
  outline: none;
  font-family: inherit;
  transition: border-color 0.15s;
}
.wpm-popup__input:focus {
  border-color: var(--accent);
}
.wpm-popup__apply {
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}
.wpm-popup__apply:hover {
  background: var(--accent-hover);
}
.wpm-popup__hint {
  display: block;
  margin-top: 8px;
  font-size: 11px;
  color: var(--text-muted);
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

.pop-enter-active {
  transition:
    opacity 0.15s,
    transform 0.15s;
}
.pop-leave-active {
  transition:
    opacity 0.1s,
    transform 0.1s;
}
.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: translateY(6px) scale(0.97);
}
</style>
