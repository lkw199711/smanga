<template>
  <div class="rt-root">
    <!-- 桌面端: 表格 -->
    <div class="rt-table-wrap">
      <table class="rt-table">
        <thead>
          <tr>
            <th v-if="selectable" class="rt-col-check">
              <input type="checkbox" :checked="allChecked" @change="toggleAll" />
            </th>
            <th v-for="col in columns" :key="col.key" :style="col.width ? { width: col.width } : {}">
              {{ col.label }}
            </th>
            <th v-if="$slots.actions" class="rt-col-actions">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in items" :key="getRowKey(item)">
            <td v-if="selectable" class="rt-col-check">
              <input type="checkbox" :value="getRowKey(item)" v-model="selectedSet" />
            </td>
            <td v-for="col in columns" :key="col.key" :data-label="col.label" :class="{ 'rt-hide-mobile': col.hideOnMobile }">
              <slot :name="`cell-${col.key}`" :item="item" :value="item[col.key]" :index="idx">
                <template v-if="col.type === 'index'">{{ (page - 1) * pageSize + idx + 1 }}</template>
                <template v-else-if="col.type === 'badge'">
                  <span :class="getBadgeClass(item, col)">{{ item[col.key] }}</span>
                </template>
                <template v-else>{{ item[col.key] ?? '-' }}</template>
              </slot>
            </td>
            <td v-if="$slots.actions" class="rt-col-actions" data-label="操作">
              <slot name="actions" :item="item" :index="idx" />
            </td>
          </tr>
          <tr v-if="items.length === 0">
            <td :colspan="totalCols" class="rt-empty">{{ emptyText }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页 -->
    <div class="rt-pager" v-if="total > pageSize">
      <button :disabled="page <= 1" @click="$emit('update:page', page - 1)">‹ 上一页</button>
      <span>第 {{ page }} / {{ Math.ceil(total / pageSize) }} 页 (共 {{ total }} 条)</span>
      <button :disabled="page >= Math.ceil(total / pageSize)" @click="$emit('update:page', page + 1)">下一页 ›</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, useSlots } from 'vue'

const slots = useSlots()

export interface RtColumn {
  key: string
  label: string
  type?: 'text' | 'badge' | 'index'
  hideOnMobile?: boolean
  width?: string
}

const props = withDefaults(defineProps<{
  columns: RtColumn[]
  items: any[]
  rowKey: string | ((item: any) => string | number)
  total: number
  page: number
  pageSize: number
  selectable?: boolean
  selected?: (number | string)[]
  emptyText?: string
}>(), {
  selectable: false,
  selected: () => [],
  emptyText: '暂无数据',
})

const emit = defineEmits<{
  'update:page': [page: number]
  'update:selected': [ids: (number | string)[]]
}>()

const selectedSet = computed({
  get: () => props.selected,
  set: (val) => emit('update:selected', val),
})

const allChecked = computed(() =>
  props.items.length > 0 && selectedSet.value.length === props.items.length
)

const totalCols = computed(() => {
  let n = props.columns.length
  if (props.selectable) n++
  if (slots.actions) n++
  return n
})

function getRowKey(item: any): string | number {
  return typeof props.rowKey === 'function' ? props.rowKey(item) : item[props.rowKey]
}

function toggleAll(e: Event) {
  const checked = (e.target as HTMLInputElement).checked
  emit('update:selected', checked ? props.items.map((r) => getRowKey(r)) : [])
}

function getBadgeClass(_item: any, col: RtColumn): string {
  return `rt-badge rt-badge-${col.key}`
}
</script>

<style scoped>
/* ===== 桌面端: 表格 ===== */
.rt-root { max-width: 1100px; }
.rt-table-wrap {
  background: #fff;
  border: 1px solid #eaeaea;
  border-radius: 12px;
  overflow-x: auto;
}
.rt-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.rt-table thead th {
  text-align: left;
  padding: 10px 12px;
  color: #6b7280;
  font-weight: 600;
  font-size: 12px;
  border-bottom: 1px solid #eaeaea;
  white-space: nowrap;
  background: #fafafa;
}
.rt-table tbody td {
  padding: 10px 12px;
  border-bottom: 1px solid #f3f4f6;
  color: #374151;
}
.rt-table tbody tr:last-child td {
  border-bottom: none;
}
.rt-table tbody tr:hover td {
  background: #fafafa;
}
.rt-col-check {
  width: 40px;
  text-align: center;
}
.rt-col-actions {
  white-space: nowrap;
  display: flex;
  gap: 6px;
}
.rt-empty {
  text-align: center;
  color: #9ca3af;
  padding: 32px 0 !important;
}

/* 分页 */
.rt-pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 16px;
  font-size: 13px;
  color: #6b7280;
}
.rt-pager button {
  padding: 6px 14px;
  font-size: 13px;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  color: #374151;
}
.rt-pager button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.rt-pager button:hover:not(:disabled) {
  background: #f3f4f6;
}

/* ===== 手机端: 卡片模式 ===== */
@media (max-width: 768px) {
  .rt-root {
    max-width: 100%;
  }

  /* 隐藏表格表头，将行变为卡片 */
  .rt-table-wrap {
    border: none;
    border-radius: 0;
    background: transparent;
    overflow-x: visible;
  }

  .rt-table,
  .rt-table tbody,
  .rt-table tr,
  .rt-table td {
    display: block;
  }

  .rt-table thead {
    display: none;
  }

  .rt-table tbody tr {
    margin-bottom: 8px;
    border: 1px solid #eaeaea;
    border-radius: 10px;
    background: #fff;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  }

  .rt-table tbody tr:hover td {
    background: inherit;
  }

  .rt-table tbody td {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 12px;
    border-bottom: 1px solid #f3f4f6;
    font-size: 13px;
    text-align: right;
    min-height: 24px;
  }

  .rt-table tbody td:last-child {
    border-bottom: none;
  }

  /* 卡片左侧标签 */
  .rt-table tbody td::before {
    content: attr(data-label);
    font-weight: 600;
    font-size: 11px;
    color: #6b7280;
    text-align: left;
    flex-shrink: 0;
    margin-right: 8px;
    white-space: nowrap;
  }

  /* 复选框列: 卡片顶部左对齐，不显示 label */
  .rt-col-check {
    padding: 6px 12px 2px;
    border-bottom: none;
    text-align: left;
    justify-content: flex-start;
  }
  .rt-col-check::before {
    display: none;
  }
  .rt-col-check input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: #2563eb;
  }

  /* 操作按钮: 卡片底部全宽 */
  .rt-col-actions {
    padding: 4px 12px 8px;
    border-bottom: none;
    justify-content: flex-end;
    border-top: 1px solid #f3f4f6;
  }
  .rt-col-actions::before {
    display: none;
  }

  /* 隐藏标记为手机端隐藏的列 */
  .rt-hide-mobile {
    display: none !important;
  }

  /* 空状态 */
  .rt-empty {
    border: 1px solid #eaeaea;
    border-radius: 12px;
    background: #fff;
    padding: 48px 20px !important;
  }
}
</style>
