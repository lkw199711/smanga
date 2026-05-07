<template>
  <el-dialog
    v-model="visible"
    :title="`${t('p2pPeers.manifestDetail')} - ${share?.shareName || ''}`"
    :close-on-click-modal="false"
    width="880px"
    top="6vh"
    @close="on_close"
  >
    <div v-loading="loading">
      <!-- 顶部元数据卡片 -->
      <div v-if="detail" class="meta-card">
        <div class="meta-row">
          <span class="label">{{ t('p2pPeers.nodeName') }}:</span>
          <span>{{ share?.nodeName || share?.nodeId }}</span>
        </div>
        <div class="meta-row">
          <span class="label">{{ t('p2pShare.shareType') }}:</span>
          <el-tag size="small">{{ detail.shareType }}</el-tag>
        </div>
        <div class="meta-row">
          <span class="label">Version:</span>
          <span>{{ detail.version }}</span>
          <span class="label" style="margin-left: 24px">Hash:</span>
          <span class="hash">{{ detail.contentHash?.slice(0, 12) }}...</span>
          <el-tag v-if="detail.payloadTruncated" type="warning" size="small" style="margin-left: 8px">
            {{ t('p2pPeers.truncated') }}
          </el-tag>
        </div>
        <div class="meta-row">
          <span class="label">Mangas:</span>
          <span>{{ detail.mangaCount }}</span>
          <span class="label" style="margin-left: 24px">Chapters:</span>
          <span>{{ detail.chapterCount }}</span>
          <span class="label" style="margin-left: 24px">Size:</span>
          <span>{{ format_size(Number(detail.totalSize || 0)) }}</span>
        </div>
        <div v-if="payloadObj?.share?.describe" class="meta-row describe">
          <span class="label">{{ t('p2pShare.describe') }}:</span>
          <span>{{ payloadObj.share.describe }}</span>
        </div>
      </div>

      <!-- Tab 切换 -->
      <el-tabs v-model="activeTab" style="margin-top: 10px">
        <el-tab-pane :label="t('p2pPeers.tabMangas')" name="mangas">
          <el-table
            :data="payloadObj?.mangas || []"
            stripe border size="small"
            max-height="480"
          >
            <el-table-column type="expand">
              <template v-slot="scope">
                <div class="chapter-list">
                  <el-table
                    :data="scope.row.chapters || []"
                    stripe size="small"
                  >
                    <el-table-column prop="chapterName" label="Chapter" show-overflow-tooltip />
                    <el-table-column prop="chapterType" label="Type" width="80" />
                    <el-table-column prop="imageCount" label="Images" width="90" />
                    <el-table-column label="Size" width="110">
                      <template v-slot="s">{{ format_size(Number(s.row.size || 0)) }}</template>
                    </el-table-column>
                    <el-table-column label="Tree" width="80">
                      <template v-slot="s">
                        <span v-if="s.row.tree?.length">{{ s.row.tree.length }}</span>
                        <span v-else class="muted">-</span>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="mangaName" label="Manga" show-overflow-tooltip />
            <el-table-column label="Cover" width="80">
              <template v-slot="scope">
                <span v-if="scope.row.mangaCover" class="muted">yes</span>
                <span v-else class="muted">-</span>
              </template>
            </el-table-column>
            <el-table-column prop="chapterCount" label="Chapters" width="100" />
            <el-table-column label="Total" width="110">
              <template v-slot="scope">{{ format_size(Number(scope.row.totalSize || 0)) }}</template>
            </el-table-column>
            <el-table-column label="Tree" width="110" align="center">
              <template v-slot="scope">
                <el-button
                  v-if="detail?.payloadTruncated"
                  size="small" link type="primary"
                  @click="fetch_manga_tree(scope.row.remoteMangaId)"
                >
                  {{ t('p2pPeers.loadTree') }}
                </el-button>
                <span v-else class="muted">inline</span>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane :label="t('p2pPeers.tabTree')" name="tree">
          <div v-if="!selectedMangaTree" class="tree-hint">
            {{ t('p2pPeers.treeHint') }}
          </div>
          <el-tree
            v-else
            :data="selectedMangaTree"
            :props="{ label: 'label', children: 'children' }"
            node-key="key"
            default-expand-all
            style="max-height: 480px; overflow: auto"
          />
        </el-tab-pane>
      </el-tabs>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import i18n from '@/i18n';
import { p2pPeerApi } from '@/api/p2p';

const { t } = i18n.global;

type ShareSummary = {
  nodeId: string;
  nodeName?: string | null;
  shareType: string;
  remoteMediaId?: number | null;
  remoteMangaId?: number | null;
  shareName: string;
  payloadTruncated?: number;
};

const props = defineProps<{
  modelValue: boolean;
  groupNo: string;
  share: ShareSummary | null;
}>();
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void;
}>();

const visible = ref(false);
const loading = ref(false);
const detail = ref<any | null>(null);
const payloadObj = ref<any | null>(null);
const activeTab = ref<'mangas' | 'tree'>('mangas');
const selectedMangaTree = ref<any[] | null>(null);

watch(() => props.modelValue, async (val) => {
  visible.value = val;
  if (val && props.share) {
    await load_detail();
  }
});
watch(visible, (v) => {
  if (!v) emit('update:modelValue', false);
});

async function load_detail() {
  if (!props.share || !props.groupNo) return;
  loading.value = true;
  detail.value = null;
  payloadObj.value = null;
  selectedMangaTree.value = null;
  try {
    const res = await p2pPeerApi.manifest(props.groupNo, {
      nodeId: props.share.nodeId,
      shareType: props.share.shareType,
      remoteMediaId: props.share.remoteMediaId ?? null,
      remoteMangaId: props.share.remoteMangaId ?? null,
    });
    const data = res?.data || res;
    detail.value = data;
    try {
      payloadObj.value = JSON.parse(data.payload);
    } catch {
      payloadObj.value = null;
    }
  } catch (err: any) {
    ElMessage.error(err?.response?.data?.message || err?.message || 'load failed');
  } finally {
    loading.value = false;
  }
}

function on_close() {
  detail.value = null;
  payloadObj.value = null;
  selectedMangaTree.value = null;
}

/** 格式化字节数 */
function format_size(bytes: number): string {
  if (!bytes || bytes <= 0) return '-';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(n >= 100 ? 0 : 1)} ${units[i]}`;
}

/** 按需拉取被截断的 manga tree */
async function fetch_manga_tree(remoteMangaId: number) {
  if (!props.groupNo) return;
  loading.value = true;
  try {
    const res = await p2pPeerApi.mangaTree(props.groupNo, remoteMangaId);
    const data = res?.data || res;
    // 将 files[] 转成 el-tree 格式
    selectedMangaTree.value = flat_files_to_tree(data?.files || [], data?.mangaName || 'root');
    activeTab.value = 'tree';
  } catch (err: any) {
    ElMessage.error(err?.response?.data?.message || err?.message || 'load failed');
  } finally {
    loading.value = false;
  }
}

/** 将 { relPath, size }[] 构造成 el-tree 数据 */
function flat_files_to_tree(
  files: Array<{ relPath: string; size: number }>,
  rootLabel: string
) {
  const root: any = { label: rootLabel, key: rootLabel, children: [] };
  const dirMap = new Map<string, any>();
  dirMap.set('', root);

  for (const f of files) {
    const parts = f.relPath.split(/[/\\]/);
    const fileName = parts.pop() || f.relPath;
    let parentKey = '';
    for (const p of parts) {
      const key = parentKey ? `${parentKey}/${p}` : p;
      if (!dirMap.has(key)) {
        const node = { label: p, key, children: [] };
        dirMap.get(parentKey).children.push(node);
        dirMap.set(key, node);
      }
      parentKey = key;
    }
    dirMap.get(parentKey).children.push({
      label: `${fileName} (${format_size(f.size)})`,
      key: `${parentKey}/${fileName}`,
    });
  }
  return [root];
}
</script>

<style scoped lang="less">
.meta-card {
  padding: 10px 16px;
  background: var(--el-fill-color-lighter);
  border-radius: 6px;
}
.meta-row {
  margin: 4px 0;
  font-size: 13px;
  .label {
    color: var(--el-text-color-secondary);
    margin-right: 6px;
  }
  .hash {
    font-family: monospace;
    color: var(--el-text-color-regular);
  }
}
.meta-row.describe {
  color: var(--el-text-color-secondary);
}
.chapter-list {
  padding: 8px 24px;
}
.tree-hint {
  padding: 30px;
  text-align: center;
  color: var(--el-text-color-secondary);
}
.muted {
  color: var(--el-text-color-placeholder);
}
</style>