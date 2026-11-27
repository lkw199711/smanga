import { onBeforeUnmount, ref } from 'vue'
import imageApi from '@/api/image'
import type { ResourceAvailability } from '@/type/availability'
import type { metaType } from '@/type/meta'

export function isBannerBackground(meta: metaType) {
  return /banner-?background/i.test(meta.metaName) || /banner-?background/i.test(meta.metaFile || '')
}

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

  async function loadMetaImage(meta: metaType, signal = controller?.signal) {
    const cacheOnly = !canLoadImages.value
    if (signal?.aborted || (!meta.metaFile && !meta.hasImageFile) || (cacheOnly && !meta.metaId)) return ''
    try {
      const src = await imageApi.getCover({
        kind: 'meta', id: meta.metaId, file: meta.metaFile || '', version: meta.updateTime, cacheOnly, signal,
      })
      return signal?.aborted ? '' : src || ''
    } catch (error) {
      if (!signal?.aborted) console.warn('漫画图片加载失败', error)
      return ''
    }
  }

  async function loadCover(id: number, file: string, version: string, signal = controller?.signal) {
    try {
      return await imageApi.getCover({ kind: 'manga', id, file, version, signal }) || ''
    } catch (error) {
      if (signal?.aborted) return ''
      throw error
    }
  }

  onBeforeUnmount(stopImageLoad)
  return { canLoadImages, beginImageLoad, stopImageLoad, applyAvailability, loadMetaImage, loadCover }
}
