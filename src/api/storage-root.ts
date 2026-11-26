import { ajax } from './index'
import type {
  StorageRoot,
  StorageRootCheckResult,
  StorageRootForm,
} from '@/type/storage-root'

const storageRootApi = {
  async list(page = 1, pageSize = 20, keyWord = '') {
    const response = await ajax.get('storage-root', {
      params: { page, pageSize, ...(keyWord.trim() && { keyWord: keyWord.trim() }) },
    })
    return response.data as { code: number; message: string; list: StorageRoot[]; count: number }
  },

  async create(form: StorageRootForm) {
    const response = await ajax.post('storage-root', form)
    return response.data.data as StorageRoot & { check?: StorageRootCheckResult }
  },

  async update(storageRootId: number, form: StorageRootForm) {
    const response = await ajax.put(`storage-root/${storageRootId}`, form)
    return response.data.data as StorageRoot & { check?: StorageRootCheckResult }
  },

  async remove(storageRootId: number) {
    const response = await ajax.delete(`storage-root/${storageRootId}`)
    return response.data.data as StorageRoot
  },

  async checkPath(rootPath: string): Promise<StorageRootCheckResult> {
    try {
      const response = await ajax.post('storage-root/check', { rootPath })
      return response.data.data as StorageRootCheckResult
    } catch (error: any) {
      const result = error?.response?.data?.data
      if (result) return result as StorageRootCheckResult
      throw error
    }
  },

  async check(storageRootId: number): Promise<StorageRootCheckResult> {
    try {
      const response = await ajax.post(`storage-root/${storageRootId}/check`)
      return response.data.data as StorageRootCheckResult
    } catch (error: any) {
      const result = error?.response?.data?.data
      if (result) return result as StorageRootCheckResult
      throw error
    }
  },
}

export default storageRootApi
