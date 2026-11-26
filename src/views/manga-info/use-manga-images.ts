import { onBeforeUnmount, ref } from 'vue'
import imageApi from '@/api/image'
import type { ResourceAvailability } from '@/type/availability'

export function useMangaImages() {
  const canLoadImages = ref(false)
  let controller: AbortController | undefined

  function stopImageLoad() {
    controller?.abort()
    controller = undefined
    canLoadImages.value = false
  }

  function beginImageLoad() {
    stopImageLoad()
    controller = new AbortController()
    return controller.signal
  }

  function applyAvailability(availability?: ResourceAvailability) {
    canLoadImages.value = !availability || availability.status === 'available'
  }

  async function loadImage(file: string, signal = controller?.signal) {
    if (!file || !canLoadImages.value || signal?.aborted) return ''
    try {
      const src = await imageApi.get({ file, signal })
      return signal?.aborted ? '' : src || ''
    } catch (error) {
      if (!signal?.aborted) console.warn('漫画图片加载失败', error)
      return ''
    }
  }

  onBeforeUnmount(stopImageLoad)
  return { canLoadImages, beginImageLoad, stopImageLoad, applyAvailability, loadImage }
}
