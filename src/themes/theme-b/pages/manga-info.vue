<template>
  <div class="tb-page">
    <button class="tb-btn-back" @click="router.back()">← 返回</button>
    <div class="tb-info-card">
      <div class="tb-info-cover"><img v-if="info.mangaCover" :src="info.mangaCover" /><div v-else class="tb-ph">📚</div></div>
      <div class="tb-info-detail">
        <h1>{{ info.mangaName || '加载�?..' }}</h1>
        <p class="tb-meta">{{ info.chapterCount || 0 }} 章节</p>
        <p class="tb-desc">{{ info.description || '暂无简介' }}</p>
        <div class="tb-tags-row" v-if="info.mangaId">
          <TagChip
            v-for="tag in info.tags"
            :key="tag.tagId"
            :name="tag.tagName"
            :color="tag.tagColor"
          />
          <button class="tb-btn-edit-tag" @click="editTagsDialog = true">
            {{ info.tags?.length ? '编辑标签' : '添加标签' }}
          </button>
        </div>
        <button class="tb-btn-read" @click="startRead">开始阅</button>
      </div>
    </div>
  </div>

  <!-- 标签编辑弹窗 -->
  <div v-if="editTagsDialog" class="tb-dialog-overlay" @click.self="editTagsDialog = false">
    <div class="tb-dialog">
      <div class="tb-dialog-head">
        <h3>编辑标签</h3>
        <button class="tb-dialog-close" @click="editTagsDialog = false">×</button>
      </div>
      <div class="tb-dialog-body">
        <TagEditor
          :manga-id="mangaId"
          :tags="info.tags || []"
          @update:tags="updateTags"
          @close="editTagsDialog = false"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import mangaApi from '@/api/manga'
import chapterApi from '@/api/chapter'
import { globalData } from '@/store'
import TagChip from '@/themes/components/tag-chip.vue'
import TagEditor from '@/themes/components/tag-editor.vue'
const router = useRouter()
const route = useRoute()
const info = ref<any>({})
const editTagsDialog = ref(false)
const mangaId = computed(() => Number(route.params.mangaId) || 0)
onMounted(async () => {
  if(!mangaId.value) return
  info.value = await mangaApi.get_manga_info(mangaId.value) || {}
  globalData.mangaName = info.value?.mangaName || globalData.mangaName
})
async function startRead() {
  if(!mangaId.value) return
  const f = await chapterApi.get_first(mangaId.value,'number')
  if(f?.chapterId) router.push(`/t/reader/${f.chapterId}`)
}
function updateTags(tags: any[]) {
  info.value.tags = tags
}
</script>

<style scoped>
.tb-btn-back { padding: 6px 14px; font-size: 13px; background: rgba(255,255,255,0.8); border: 1px solid rgba(0,0,0,0.1); border-radius: 20px; color: #1f2937; cursor: pointer; margin-bottom: 20px; display: inline-block; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
.tb-btn-back:hover { background: rgba(255,255,255,1); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.tb-info-card { display: flex; gap: 32px; background: rgba(255,255,255,0.8); backdrop-filter: blur(8px); border: 1px solid rgba(0,0,0,0.1); border-radius: 20px; padding: 32px; box-shadow: 0 8px 32px rgba(0,0,0,0.08); }
.tb-info-cover { flex-shrink: 0; width: 180px; height: 260px; border-radius: 14px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.1); }
.tb-info-cover img { width: 100%; height: 100%; object-fit: cover; }
.tb-ph { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 40px; background: linear-gradient(135deg, #6366f1, #a855f7); }
.tb-info-detail h1 { font-size: 22px; font-weight: 700; margin: 0 0 8px; color: #1f2937; }
.tb-meta { font-size: 13px; color: #6b7280; margin: 0 0 12px; }
.tb-desc { font-size: 14px; color: #374151; line-height: 1.6; margin: 0 0 24px; }
.tb-btn-read { padding: 10px 24px; background: linear-gradient(135deg, #a855f7, #ec4899); border: none; border-radius: 20px; color: #1f2937; font-weight: 500; cursor: pointer; font-size: 14px; box-shadow: 0 4px 16px rgba(168,85,247,0.3); }
.tb-btn-read:hover { box-shadow: 0 6px 20px rgba(168,85,247,0.4); transform: translateY(-1px); }
.tb-tags-row { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-bottom: 20px; }
.tb-btn-edit-tag { padding: 4px 12px; font-size: 12px; color: var(--sd-primary, #2563eb); background: none; border: 1px dashed var(--sd-primary, #2563eb); border-radius: 999px; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
.tb-btn-edit-tag:hover { background: var(--sd-primary, #2563eb); color: #fff; }
/* dialog */
.tb-dialog-overlay { position: fixed; inset: 0; z-index: 200; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; }
.tb-dialog { background: #fff; border-radius: 14px; width: 520px; max-width: 90vw; max-height: 85vh; overflow-y: auto; box-shadow: 0 8px 32px rgba(0,0,0,0.12); }
.tb-dialog-head { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #eaeaea; }
.tb-dialog-head h3 { margin: 0; font-size: 16px; font-weight: 600; }
.tb-dialog-close { width: 32px; height: 32px; border: none; background: none; font-size: 20px; cursor: pointer; color: #9ca3af; border-radius: 6px; }
.tb-dialog-close:hover { background: #f3f4f6; }
.tb-dialog-body { padding: 20px; }
</style>

