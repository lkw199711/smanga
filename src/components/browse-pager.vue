<template>
  <div class="browse-pager">
    <!--分页-->
    <el-pagination :class="['pagination', { android: config.android }]" v-model:current-page="pagerPage"
      v-model:page-size="pageSize" :default-current-page="1" :page-sizes="pageSizes" :pager-count="pageCount"
      :small="pageSmall" :disabled="disabled" :background="background" :layout="pageLayout" :total="props.count"
      @size-change="size_change" @current-change="page_change" />
  </div>
</template>

<script lang="ts">
export default { name: 'browse-pager' }
</script>
<script setup lang='ts'>
import { ref, reactive, computed, watch } from 'vue'
import { config } from "@/store";
import { ElMessage } from "element-plus";
import i18n from '@/i18n';
import { onMounted, onUnmounted } from 'vue';
const { t } = i18n.global;

const pageSize = ref(1);
const disabled = ref(false);
const background = ref(true);
const pageSizes = ref([1, 2, 3, 4]);

// 传值
const props = defineProps(['page', 'count', 'pageSizeConfig', 'setPageSize']);
const emit = defineEmits(['pageChange', 'reloadPage']);
defineExpose({ page_change, reload, reload_static, before, next });

let pagerPage = ref(1);

watch(
  () => props.page,
  (val) => {
    pagerPage.value = val;
  }
)

const pageCount = computed(() => {
  // 展示最大页码数量
  const screenType = config.screenType;
  switch (screenType) {
    case '2k':
      return 46;
    case 'large':
      return 17;
    case 'middle':
      return 11;
    case 'small':
      return 7;
    case 'mini':
      return 5;
    default:
      return 21;
  }
})

let pageSmall = computed(() => {
  const screenType = config.screenType;
  switch (screenType) {
    case 'large':
      return false;
    case 'middle':
      return false;
    case 'small':
      return true;
    case 'mini':
      return true;
    default:
      return false;
  }
})

let pageLayout = computed(() => {
  const screenType = config.screenType;
  switch (screenType) {
    case 'large':
      return 'total, sizes, prev, pager, next, jumper';
    case 'middle':
      return 'sizes, prev, pager, next, jumper';
    case 'small':
      return 'prev, pager, next, jumper';
    case 'mini':
      return 'prev, pager, next, jumper';
    default:
      return 'total, sizes, prev, pager, next, jumper';
  }
})

/**
 * 页码尺寸变更
 * @param size
 */
function size_change(size: number) {
  pageSize.value = size;
  page_change();
}

/**
 * 页码变更
 * @param page
 */
function page_change(pageParams = 1) {
  emit('pageChange', pageParams, pageSize.value);
}
/**
 * 重载数据 不改变页码
 */
function reload() {
  emit('reloadPage', props.page, false);
}

/**
 * 重载数据 不改变页码
 */
function reload_static() {
  emit('pageChange', props.page, false);
}

/**
 * 上一页
 */
function before() {  
  if (props.page > 1) {
    page_change(props.page - 1);
  } else {
    ElMessage.warning(t('page.firstPage'));
  }
}

/**
 * 下一页
 */
function next() {
  if (props.page < props.count / pageSize.value) {
    page_change(props.page + 1);
  } else {
    ElMessage.warning(t('page.lastPage'));
  }
}

/**
 * @description: pc 键盘相应事件
 * @param {*} event
 * @return {*}
 */
function direction_key(event: any) {
  const key = event.keyCode;
  switch (key) {
    case 37://"按了←键！"
      before();
      break;
    // case 38://"按了↑键！"
    //   alert("按了↑键！");
    //   break;
    case 39://"按了→键！"
      next();
      break;
    // case 40://"按了↓键！"
    //   alert("按了↓键！");
    //   break;
  }
}

// 生命周期
onMounted(() => {
  // 设置页容量
  if (props.setPageSize) {
    pageSize.value = props.setPageSize;
  }

  window.addEventListener('keydown', direction_key);
})

onUnmounted(() => {
  window.removeEventListener('keydown', direction_key);
})

</script>

<style scoped lang='less'>
.pagination.android {
  padding-bottom: 2rem;
}

@media only screen and (min-width: 1200px) {
  :deep(.el-pagination__jump) {
    margin-left: .12rem;
  }
}

@media only screen and (max-width: 1199px) and (min-width: 768px) {
  :deep(.el-pagination__jump) {
    margin-left: .8rem;
  }
}

@media only screen and (max-width: 767px) {
  :deep(.el-pagination__jump) {
    margin-left: .4rem;
  }
}
</style>
