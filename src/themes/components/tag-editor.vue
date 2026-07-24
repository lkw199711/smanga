<template>
  <div class="tm-tag-editor">
    <div class="tm-tag-editor__section">
      <p class="tm-tag-editor__title">可选标签</p>
      <div class="tm-tag-editor__chips">
        <TagChip
          v-for="(tag, idx) in availableTags"
          :key="tag.tagId"
          :name="tag.tagName"
          :color="tag.tagColor"
          :clickable="true"
          @click="addTag(tag, idx)"
        />
      </div>
      <p v-if="availableTags.length === 0" class="tm-tag-editor__empty">所有标签已添加</p>
    </div>

    <div class="tm-tag-editor__section" v-if="assignedTags.length > 0">
      <p class="tm-tag-editor__title">已选标签</p>
      <div class="tm-tag-editor__chips">
        <TagChip
          v-for="(tag, idx) in assignedTags"
          :key="tag.tagId"
          :name="tag.tagName"
          :color="tag.tagColor"
          :active="true"
          :clickable="true"
          @click="removeTag(tag, idx)"
        />
      </div>
    </div>

    <div class="tm-tag-editor__footer">
      <button class="tm-btn tm-btn--primary" :disabled="saving" @click="save">
        {{ saving ? '保存中...' : '确认' }}
      </button>
      <button class="tm-btn tm-btn--ghost" @click="$emit('close')">取消</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import TagChip from './tag-chip.vue'
import tagApi, { tagItemType } from '@/api/tag'

const props = defineProps<{
  mangaId: number
  tags: tagItemType[]
}>()

const emit = defineEmits<{
  'update:tags': [tags: tagItemType[]]
  close: []
}>()

const availableTags = ref<tagItemType[]>([])
const assignedTags = ref<tagItemType[]>([])
const saving = ref(false)
const metaWriteJson = ref(true)

onMounted(async () => {
  assignedTags.value = [...props.tags]
  try {
    const allTags = (await tagApi.get_nopage()) as tagItemType[]
    const assignedIds = new Set(assignedTags.value.map(t => t.tagId))
    availableTags.value = allTags.filter(t => !assignedIds.has(t.tagId))
  } catch {
    availableTags.value = []
  }
})

function addTag(tag: tagItemType, idx: number) {
  availableTags.value.splice(idx, 1)
  assignedTags.value.push(tag)
}

function removeTag(tag: tagItemType, idx: number) {
  assignedTags.value.splice(idx, 1)
  availableTags.value.push(tag)
}

async function save() {
  saving.value = true
  try {
    await tagApi.add_manga_tag(props.mangaId, assignedTags.value, metaWriteJson.value)
    emit('update:tags', [...assignedTags.value])
    emit('close')
  } catch (e: any) {
    alert(e?.message || '保存失败')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.tm-tag-editor {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.tm-tag-editor__section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tm-tag-editor__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--sd-text, #374151);
  margin: 0;
}

.tm-tag-editor__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tm-tag-editor__empty {
  font-size: 12px;
  color: var(--sd-text-secondary, #9ca3af);
  margin: 0;
}

.tm-tag-editor__footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--sd-border, #eaeaea);
}

.tm-btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.15s;
}
.tm-btn--primary {
  background: var(--sd-primary, #2563eb);
  color: #fff;
}
.tm-btn--primary:hover {
  background: var(--sd-primary-hover, #1d4ed8);
}
.tm-btn--primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.tm-btn--ghost {
  background: var(--sd-bg2, #fff);
  color: var(--sd-text, #374151);
  border: 1px solid var(--sd-border, #eaeaea);
}
.tm-btn--ghost:hover {
  background: var(--sd-bg-hover, #f3f4f6);
}
</style>
