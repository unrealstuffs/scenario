import { ref, onMounted, onUnmounted } from "vue";

/**
 * Composable для реактивного отслеживания мобильного экрана.
 * @param breakpoint Порог ширины в пикселях (по умолчанию 700px)
 */
export function useMobile(breakpoint = 700) {
  const isMobile = ref(false);

  function checkMobile() {
    if (typeof window !== "undefined") {
      isMobile.value = window.innerWidth < breakpoint;
    }
  }

  onMounted(() => {
    checkMobile();
    window.addEventListener("resize", checkMobile);
  });

  onUnmounted(() => {
    if (typeof window !== "undefined") {
      window.removeEventListener("resize", checkMobile);
    }
  });

  return { isMobile };
}
