import { defineStore } from 'pinia'

function revokeBlobUrl(url: string) {
	if (url.startsWith('blob:')) URL.revokeObjectURL(url)
}

/**
 * 图片 Object URL 的进程内 LRU 缓存。
 *
 * 原实现把动态字段直接挂在空 Pinia store 上，既没有明确 state，也没有在淘汰时
 * revokeObjectURL。这里将缓存状态和生命周期统一收口。
 */
const useImageStore = defineStore('image-cache', {
	state: () => ({
		urls: {} as Record<string, string>,
		order: [] as string[],
	}),

	actions: {
		get(file: string) {
			const url = this.urls[file]
			if (!url) return ''
			this.order = this.order.filter((key) => key !== file)
			this.order.push(file)
			return url
		},

		set(file: string, url: string, limit = 0) {
			const previous = this.urls[file]
			if (previous && previous !== url) revokeBlobUrl(previous)

			this.urls[file] = url
			this.order = this.order.filter((key) => key !== file)
			this.order.push(file)

			if (limit > 0) {
				while (this.order.length > limit) {
					const oldest = this.order.shift()
					if (!oldest) break
					const evicted = this.urls[oldest]
					delete this.urls[oldest]
					if (evicted) revokeBlobUrl(evicted)
				}
			}
			return url
		},

		remove(file: string) {
			const url = this.urls[file]
			delete this.urls[file]
			this.order = this.order.filter((key) => key !== file)
			if (url) revokeBlobUrl(url)
		},

		clear() {
			for (const url of Object.values(this.urls as Record<string, string>)) revokeBlobUrl(url)
			this.urls = {}
			this.order = []
		},
	},
})

export default useImageStore
