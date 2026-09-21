import { ref, watch } from "vue";
import {
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { db, scenariosCol } from "./firebase/firestore";
import type { Note } from "./types";

// ─── localStorage helpers ─────────────────────────────────────────────────────
const STORAGE_KEY = "notes-app-data";

function loadFromStorage(): Note[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(notes: Note[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

// ─── Reactive state ───────────────────────────────────────────────────────────
// Инициализируем из localStorage сразу — чтобы UI не был пустым пока грузится Firestore
const notes = ref<Note[]>(loadFromStorage());

// Синхронизируем localStorage при каждом изменении
watch(notes, (val) => saveToStorage(val), { deep: true });

// ─── Firestore real-time listener ─────────────────────────────────────────────
// onSnapshot подписывается на коллекцию и получает обновления в реальном времени.
// Когда вы сохраняете заметку на ПК — телефон получит изменение автоматически.
const q = query(scenariosCol, orderBy("updatedAt", "desc"));

onSnapshot(
  q,
  (snapshot) => {
    // Заменяем весь список данными из Firestore
    notes.value = snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Note, "id">),
    }));
  },
  (error) => {
    console.warn("[Firestore] Snapshot error:", error.message);
    // При ошибке остаёмся на localStorage-данных
  },
);

// ─── Firestore write helpers ──────────────────────────────────────────────────
async function firestoreSet(note: Note) {
  const { id, ...data } = note;
  await setDoc(doc(db, "scenarios", id), data);
}

async function firestoreDelete(id: string) {
  await deleteDoc(doc(db, "scenarios", id));
}

// ─── Composable ───────────────────────────────────────────────────────────────
export function useNotes() {
  function createNote(): Note {
    const now = Date.now();
    const note: Note = {
      id: crypto.randomUUID(),
      title: "Новая заметка",
      content: "",
      createdAt: now,
      updatedAt: now,
    };
    // Оптимистично добавляем локально — onSnapshot подтвердит/обновит
    notes.value.unshift(note);
    firestoreSet(note).catch((e) =>
      console.warn("[Firestore] Create failed:", e.message),
    );
    return note;
  }

  function updateNote(
    id: string,
    patch: Partial<Pick<Note, "title" | "content">>,
  ) {
    const note = notes.value.find((n) => n.id === id);
    if (!note) return;
    const updated = { ...note, ...patch, updatedAt: Date.now() };
    Object.assign(note, updated);
    firestoreSet(updated).catch((e) =>
      console.warn("[Firestore] Update failed:", e.message),
    );
  }

  function deleteNote(id: string) {
    const idx = notes.value.findIndex((n) => n.id === id);
    if (idx !== -1) notes.value.splice(idx, 1);
    firestoreDelete(id).catch((e) =>
      console.warn("[Firestore] Delete failed:", e.message),
    );
  }

  function getNoteById(id: string): Note | undefined {
    return notes.value.find((n) => n.id === id);
  }

  return { notes, createNote, updateNote, deleteNote, getNoteById };
}
