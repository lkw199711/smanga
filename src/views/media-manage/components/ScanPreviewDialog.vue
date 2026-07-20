<template>
  <el-dialog v-model="visible" title="扫描预检" width="min(920px, 94vw)" destroy-on-close>
    <div v-loading="loading">
      <template v-if="result">
        <el-alert v-if="!result.ok" title="预检未通过，正式扫描不会执行" type="error" :closable="false" show-icon class="mb-4" />

        <el-descriptions :column="previewColumns" border>
          <el-descriptions-item label="模板">{{ result.template?.label || '-' }}</el-descriptions-item>
          <el-descriptions-item label="漫画">{{ result.summary?.mangaFound ?? 0 }}</el-descriptions-item>
          <el-descriptions-item label="章节">{{ result.summary?.chapterFound ?? 0 }}</el-descriptions-item>
          <el-descriptions-item label="跳过">{{ result.summary?.skipped ?? 0 }}</el-descriptions-item>
          <el-descriptions-item label="警告">{{ result.summary?.warnings ?? 0 }}</el-descriptions-item>
          <el-descriptions-item label="错误">{{ result.summary?.errors ?? 0 }}</el-descriptions-item>
        </el-descriptions>

        <el-descriptions class="mt-4" :column="previewColumns" border>
          <el-descriptions-item label=".smanga">{{ result.metadataSummary?.smanga ?? 0 }}</el-descriptions-item>
          <el-descriptions-item label="旁挂元数据">{{ result.metadataSummary?.smangaSidecar ?? 0 }}</el-descriptions-item>
          <el-descriptions-item label="series.json">{{ result.metadataSummary?.seriesJson ?? 0 }}</el-descriptions-item>
          <el-descriptions-item label="ComicInfo">{{ result.metadataSummary?.comicInfoCandidate ?? 0 }}</el-descriptions-item>
        </el-descriptions>

        <template v-if="result.templateCandidates?.length">
          <div class="section-title">模板推荐</div>
          <el-table :data="result.templateCandidates.slice(0, 6)" size="small" border max-height="240">
            <el-table-column prop="label" label="模板" min-width="190" />
            <el-table-column prop="pattern" label="结构" min-width="230" />
            <el-table-column prop="mangaFound" label="漫画" width="72" />
            <el-table-column prop="chapterFound" label="章节" width="72" />
            <el-table-column prop="score" label="评分" width="72" />
            <el-table-column label="操作" width="82">
              <template #default="scope">
                <el-button v-if="scope.row.key !== 'auto' && scope.row.key !== 'legacy'" link type="primary" @click="emit('apply-template', scope.row.key)">
                  采用
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </template>

        <div class="section-title">样例漫画</div>
        <el-table :data="result.samples || []" size="small" border max-height="240">
          <el-table-column prop="mangaName" label="漫画" min-width="160" />
          <el-table-column prop="parentPath" label="所在目录" min-width="260" show-overflow-tooltip />
          <el-table-column label="章节" width="80">
            <template #default="scope">{{ scope.row.chapters?.length || 0 }}</template>
          </el-table-column>
        </el-table>

        <div class="section-title">提示、跳过与错误</div>
        <el-table :data="importantItems" size="small" border max-height="300">
          <el-table-column label="级别" width="82">
            <template #default="scope">
              <el-tag :type="levelTagType(scope.row.level)" size="small">{{ levelText(scope.row.level) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="reasonCode" label="原因" width="190" show-overflow-tooltip />
          <el-table-column prop="reason" label="说明" min-width="240" show-overflow-tooltip />
          <el-table-column prop="targetName" label="对象" min-width="150" show-overflow-tooltip />
          <el-table-column prop="targetPath" label="路径" min-width="220" show-overflow-tooltip />
        </el-table>
      </template>
      <el-empty v-else description="暂无预检结果" />
    </div>

    <template #footer>
      <el-button type="primary" @click="visible = false">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import {computed} from 'vue';
import type {ScanPreviewResult, ScanReportLevel, ScanTemplateKey} from '@/type/scan';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    result: ScanPreviewResult | null;
    loading?: boolean;
  }>(),
  {
    loading: false,
  }
);

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void;
  (event: 'apply-template', value: ScanTemplateKey): void;
}>();

const visible = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
});

const previewColumns = computed(() => (window.innerWidth < 720 ? 2 : 4));
const importantItems = computed(() => (props.result?.items || []).filter(item => item.level !== 'info' || item.category === 'skipped').slice(0, 100));

function levelTagType(level: ScanReportLevel) {
  if (level === 'error') return 'danger';
  if (level === 'warning') return 'warning';
  return 'info';
}

function levelText(level: ScanReportLevel) {
  if (level === 'error') return '错误';
  if (level === 'warning') return '警告';
  return '信息';
}
</script>

<style scoped>
.section-title {
  margin: 18px 0 8px;
  font-size: 15px;
  font-weight: 600;
}

.mb-4 {
  margin-bottom: 16px;
}
</style>
