export type StorageRootStatus = 'unknown' | 'available' | 'unavailable'

export interface StorageRoot {
  storageRootId: number
  rootKey: string
  rootName: string
  providerKey: string
  iconKey: string
  rootPath: string
  enabled: number
  description?: string | null
  lastCheckStatus: StorageRootStatus
  lastCheckTime?: string | null
  lastCheckMessage?: string | null
  deleteFlag: number
  createTime: string
  updateTime: string
  pathCount: number
}

export interface StorageRootForm {
  rootKey?: string
  rootName: string
  providerKey: string
  iconKey: string
  rootPath: string
  enabled: number
  description?: string
}

export interface StorageRootCheckResult {
  available: boolean
  status: 'available' | 'unavailable'
  code: string
  message: string
  normalizedPath: string
  checkedAt: string
}
