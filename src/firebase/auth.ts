import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { ref } from "vue";
import type { User } from "firebase/auth";
import { app } from "./firebase";

export const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// ─── Reactive state ───────────────────────────────────────────────────────────
export const currentUser = ref<User | null>(auth.currentUser);
export const authLoading = ref(true);

// Слушаем изменения состояния авторизации
auth.onAuthStateChanged((user) => {
  currentUser.value = user;
  authLoading.value = false;
});

// ─── Actions ──────────────────────────────────────────────────────────────────
export async function signInWithGoogle() {
  try {
    await signInWithPopup(auth, provider);
  } catch (e: any) {
    // Пользователь закрыл попап — не ошибка
    if (
      e.code !== "auth/popup-closed-by-user" &&
      e.code !== "auth/cancelled-popup-request"
    ) {
      console.error("[Auth] Sign in failed:", e.message);
    }
  }
}

export async function signOutUser() {
  await signOut(auth);
}
