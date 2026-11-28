import { ajax } from './index'

export type DirectoryMigrationCheck = {
  available: boolean
  message: string
  source: { available: boolean; path: string; resolvedPath?: string; message: string }
  target: { available: boolean; path: string; resolvedPath?: string; message: string }
}

type DirectoryMigrationInput = {
  sourcePath: string
  targetPath: string
  mirrorDelete: boolean
  deleteSource: boolean
}

const systemToolsApi = {
  async checkDirectoryMigration(input: DirectoryMigrationInput) {
    const response = await ajax.post('system-tools/directory-migration/check', input)
    return response.data.data as DirectoryMigrationCheck
  },

  async createDirectoryMigrationTarget(targetPath: string) {
    const response = await ajax.post('system-tools/directory-migration/target', { targetPath })
    return response.data.data as DirectoryMigrationCheck['target']
  },

  async createDirectoryMigration(input: DirectoryMigrationInput) {
    const response = await ajax.post('system-tools/directory-migration', input)
    return response.data.data as { jobId: string; check: DirectoryMigrationCheck }
  },
}

export default systemToolsApi
