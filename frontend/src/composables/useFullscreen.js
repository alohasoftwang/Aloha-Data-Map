import { onBeforeUnmount, onMounted, ref } from 'vue'

export function useFullscreen(targetRef, onChange) {
  const isFullscreen = ref(false)

  function syncState() {
    isFullscreen.value = document.fullscreenElement === targetRef.value
    onChange?.()
  }

  async function enter() {
    if (!targetRef.value) return
    await targetRef.value.requestFullscreen()
  }

  async function exit() {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
    }
  }

  async function toggle() {
    if (isFullscreen.value) {
      await exit()
    } else {
      await enter()
    }
  }

  onMounted(() => {
    document.addEventListener('fullscreenchange', syncState)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('fullscreenchange', syncState)
  })

  return { isFullscreen, toggle, enter, exit }
}
