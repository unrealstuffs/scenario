<template>
  <header class="header">
    <!-- Логотип — клик открывает авторизацию или выход -->
    <button
      class="header__logo-btn"
      @click="handleLogoClick"
      :title="logoTitle"
    >
      <img :src="kgbSrc" alt="Логотип" class="header__logo" />
    </button>

    <div class="logo">
      <h1>КГБ Ромашковой Долины</h1>
      <p>Хранилище рассекреченных материалов</p>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { currentUser, signInWithGoogle, signOutUser } from "../firebase/auth";

const kgbSrc = new URL("/assets/images/kgb.png", import.meta.url).href;

const logoTitle = computed(() =>
  currentUser.value
    ? "Текущий юзер: " + currentUser.value.displayName
    : "Войти через Google",
);

function handleLogoClick() {
  if (currentUser.value) {
    signOutUser();
  } else {
    signInWithGoogle();
  }
}
</script>

<style scoped>
.header {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 16px 40px;
  flex-shrink: 0;
  background: var(--bg-secondary);
  margin-bottom: 40px;
  position: relative;
  z-index: 0;
  gap: 20px;
}

.header__logo-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  flex-shrink: 0;
  border-radius: 8px;
  transition:
    opacity 0.15s,
    transform 0.15s;
}
.header__logo-btn:hover {
  opacity: 0.85;
  transform: scale(1.03);
}
.header__logo-btn:active {
  transform: scale(0.97);
}

.header__logo {
  height: 70px;
  width: auto;
  object-fit: contain;
  display: block;
}

.logo {
  flex: 1;
  min-width: 0;

  h1 {
    font-size: 28px;
  }
}

/* ── Auth zone (right side) ─────────────────── */
.header__auth {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.header__auth-icon {
  font-size: 20px;
  color: var(--text-muted);
}

.header__avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--accent);
  cursor: pointer;
}

.header__signin-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}
.header__signin-btn:hover {
  background: var(--accent-hover);
}

/* ── Mobile ─────────────────────────────────── */
@media (max-width: 699px) {
  .header {
    padding: 12px 16px;
    gap: 12px;
  }
  .header__logo {
    height: 44px;
  }
  .logo h1 {
    font-size: 16px;
  }
  .logo p {
    font-size: 12px;
  }
}
</style>
