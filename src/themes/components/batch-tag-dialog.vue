<template>
  <el-dialog
    :model-value="modelValue"
    title="批量修改标签"
    width="min(54rem, 92vw)"
    append-to-body
    destroy-on-close
    :close-on-click-modal="false"
    :close-on-press-escape="!saving"
    :show-close="!saving"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <p class="batch-tag-summary">
      {{ target === 'chapter'
        ? `已选 ${ids.length} 章，将修改所属的 ${mangaCount ? mangaCount + ' 部' : ''}漫画。`
        : `将修改 ${ids.length} 部漫画的标签。` }}
    </p>
    <p v-if="ids.length > 1000" class="batch-tag-warning" role="alert">一次最多可为 1000 项修改标签，请减少选择数量。</p>
    <fieldset :disabled="saving" class="batch-tag-options">
      <legend>操作方式</legend>
      <label v-for="option in operations" :key="option.value">
        <input v-model="operation" type="radio" :value="option.value" @change="confirmReplace = false" />
        {{ option.label }}
      </label>
    </fieldset>
    <input v-model="search" class="batch-tag-search" type="search" placeholder="搜索标签" aria-label="搜索标签" :disabled="saving" />
    <div v-if="assigned.length" class="batch-tag-chips" aria-label="已选标签">
      <button v-for="tag in assigned" :key="tag.tagId" type="button" class="batch-tag-chip-button"
        :aria-label="`取消选择 ${tag.tagName}`" :disabled="saving" @click="removeTag(tag)">
        <TagChip :name="tag.tagName" :color="tag.tagColor" active />
      </button>
    </div>
    <div class="batch-tag-chips batch-tag-available" aria-label="可选标签">
      <button v-for="tag in availableFiltered" :key="tag.tagId" type="button" class="batch-tag-chip-button"
        :disabled="saving || assigned.length >= 100" @click="addTag(tag)">
        <TagChip :name="tag.tagName" :color="tag.tagColor" show-dot />
      </button>
      <p v-if="loading">正在加载标签…</p>
      <p v-else-if="loadFailed">标签加载失败。<button type="button" @click="loadTags(true)">重试</button></p>
      <p v-else-if="!availableFiltered.length">{{ search ? '没有匹配的标签' : '没有更多可选标签' }}</p>
    </div>
    <p v-if="assigned.length >= 100" class="batch-tag-summary">一次最多可选 100 个标签。</p>
    <label class="batch-tag-sync">
      <input v-model="metaWriteJson" type="checkbox" :disabled="saving" />
      同步写入 meta.json
    </label>
    <p v-if="confirmReplace" class="batch-tag-warning" role="alert">
      {{ assigned.length ? '所选漫画已有的其他标签将被移除。' : '所选漫画的标签将被全部清空。' }}
    </p>
    <template #footer>
      <el-button :disabled="saving" @click="emit('update:modelValue', false)">取消</el-button>
      <el-button :type="confirmReplace ? 'danger' : 'primary'" :loading="saving"
        :disabled="!ids.length || ids.length > 1000 || (!assigned.length && operation !== 'replace')"
        @click="submit">{{ confirmReplace ? '确认替换' : '应用' }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { updateBatchTags, type BatchTagOperation } from '@/api/batch'
import { batchError } from '@/themes/composables/use-batch-selection'
import { showThemeAlert } from './theme-alert'
import TagChip from './tag-chip.vue'
import { useTagPicker } from './composables/use-tag-picker'

const props = defineProps<{
  modelValue: boolean
  target: 'manga' | 'chapter'
  ids: number[]
  mangaCount?: number
}>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  applied: [ids: number[]]
}>()

const operation = ref<BatchTagOperation>('add')
const metaWriteJson = ref(false)
const confirmReplace = ref(false)
const saving = ref(false)
const loadFailed = ref(false)
const operations: { value: BatchTagOperation; label: string }[] = [
  { value: 'add', label: '添加' },
  { value: 'remove', label: '移除' },
  { value: 'replace', label: '替换' },
]
const { assigned, search, loading, availableFiltered, loadAllTags, addTag, removeTag } = useTagPicker([])

async function loadTags(force = false) {
  loadFailed.value = !(await loadAllTags(force))
}

watch(() => props.modelValue, (open) => {
  if (!open) return
  operation.value = 'add'
  metaWriteJson.value = false
  confirmReplace.value = false
  assigned.value = []
  search.value = ''
  void loadTags()
}, { immediate: true })

watch(assigned, () => { confirmReplace.value = false }, { deep: true })

async function submit() {
  if (saving.value) return
  if (operation.value === 'replace' && !confirmReplace.value) {
    confirmReplace.value = true
    return
  }
  const ids = [...props.ids]
  saving.value = true
  try {
    const result = await updateBatchTags(props.target, ids, operation.value, assigned.value.map((tag) => tag.tagId), metaWriteJson.value)
    ElMessage.success(`已更新 ${result.count} 部漫画的标签`)
    if (result.metadataFailedIds.length) {
      showThemeAlert(`${result.metadataFailedIds.length} 部漫画的 meta.json 写入失败。漫画 ID：${result.metadataFailedIds.join('、')}`)
    }
    emit('applied', ids)
    emit('update:modelValue', false)
  } catch (error) {
    ElMessage.error(batchError(error, '标签修改失败'))
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.batch-tag-summary { margin: 0 0 1.2rem; }
.batch-tag-options { display: flex; flex-wrap: wrap; gap: 0.8rem 1.6rem; margin: 0 0 1.2rem; }
.batch-tag-options legend { margin-bottom: 0.6rem; font-weight: 600; }
.batch-tag-options label, .batch-tag-sync { display: inline-flex; align-items: center; gap: 0.4rem; }
.batch-tag-search {
  box-sizing: border-box;
  width: 100%;
  padding: 0.7rem 1rem;
  border: 1px solid var(--el-border-color);
  border-radius: 0.6rem;
  background: var(--el-fill-color-blank);
  color: inherit;
  font: inherit;
}
.batch-tag-chips { display: flex; flex-wrap: wrap; align-content: flex-start; gap: 0.6rem; padding: 0.8rem 0; }
.batch-tag-available { max-height: 26vh; overflow: auto; }
.batch-tag-chips p { margin: 0; }
.batch-tag-chip-button { padding: 0; border: 0; border-radius: 0.7rem; background: transparent; font: inherit; cursor: pointer; }
.batch-tag-chip-button:disabled { opacity: 0.55; cursor: default; }
.batch-tag-chip-button:focus-visible { outline: 2px solid var(--el-color-primary); outline-offset: 2px; }
.batch-tag-sync { margin-top: 0.8rem; }
.batch-tag-warning { margin: 1rem 0 0; color: var(--el-color-danger); }
</style>
