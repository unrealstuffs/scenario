import { ref, watch } from "vue";
import {
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  type Unsubscribe,
} from "firebase/firestore";
import { db, scenariosCol } from "./firebase/firestore";
import { currentUser } from "./firebase/auth";
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

// ─── UUID без crypto.randomUUID (требует HTTPS) ───────────────────────────────
function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0"));
    return [
      hex.slice(0, 4).join(""),
      hex.slice(4, 6).join(""),
      hex.slice(6, 8).join(""),
      hex.slice(8, 10).join(""),
      hex.slice(10, 16).join(""),
    ].join("-");
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

// ─── Reactive state ───────────────────────────────────────────────────────────
const notes = ref<Note[]>(loadFromStorage());

watch(notes, (val) => saveToStorage(val), { deep: true });

// ─── Firestore подписка — стартует только при авторизации ─────────────────────
let unsubscribe: Unsubscribe | null = null;

watch(
  currentUser,
  (user) => {
    // Отписываемся от предыдущей подписки (если была)
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }

    if (!user) {
      // Пользователь вышел — очищаем список
      notes.value = [];
      return;
    }

    // Пользователь вошёл — подписываемся на коллекцию
    const q = query(scenariosCol, orderBy("updatedAt", "desc"));
    unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        notes.value = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Note, "id">),
        }));
      },
      (error) => {
        console.warn("[Firestore] Snapshot error:", error.message);
      },
    );
  },
  { immediate: true },
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
      id: generateId(),
      title: "Новый материал",
      content: "",
      createdAt: now,
      updatedAt: now,
    };
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
