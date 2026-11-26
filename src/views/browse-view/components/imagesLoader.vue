<template>
  <!-- 解压缩状态指示器 -->
  <div v-if="!browseStore.imageLoaded" class="compression-overlay">
    <div class="compression-content">
      <storage-availability-notice
        v-if="errorMessage"
        :message="errorMessage"
        retry
        retry-label="重试"
        @retry="chapter_images_load()"
      />
      <div v-else class="spinner"></div>
      <div v-if="!errorMessage" class="text-content">
        <div class="main-text">{{ compressStateTipText[compressState] }}</div>
        <div class="sub-text">{{ `${waitTime}/${maxWaitTime} 秒` }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref, onMounted, onBeforeUnmount} from 'vue';
import chapterApi from '@/api/chapter';
import useBrowseStore from '@/store/browse';
import {useRoute} from 'vue-router';
import imageApi from '@/api/image';
import StorageAvailabilityNotice from '@/components/storage-availability-notice.vue';

const route = useRoute();
const browseStore = useBrowseStore();
const compressState = ref<'loadingImages' | 'compressing' | 'compressed' | 'failed'>('loadingImages');
const errorMessage = ref('');
let intervalId: ReturnType<typeof setInterval> | undefined;
let retryId: ReturnType<typeof setTimeout> | undefined;
let loadId = 0;
const waitTime = ref(0);
const maxWaitTime = 30;
defineProps({
  compressState: {
    type: String,
    default: 'loadingImages',
  },
});

const emit = defineEmits(['page_change']);

const compressStateTipText = {
  loadingImages: '加载中',
  compressing: '解压缩中',
  compressed: '加载完成',
  failed: '加载失败',
};

onMounted(() => chapter_images_load());
onBeforeUnmount(() => {
  loadId++;
  stopTimers();
});

function stopTimers() {
  clearInterval(intervalId);
  clearTimeout(retryId);
}

async function chapter_images_load(
  chapterId = Number(route.query.chapterId || route.params.chapterId)
) {
  const current = ++loadId;
  stopTimers();
  browseStore.imageLoaded = false;
  errorMessage.value = '';
  compressState.value = 'loadingImages';
  waitTime.value = 0;
  intervalId = setInterval(() => {
    if (++waitTime.value >= maxWaitTime) fail_loader('加载超时，请重试。');
  }, 1000);

  const poll = async (attempt: number) => {
    try {
      const result = await chapterApi.get_images(chapterId, attempt);
      if (current !== loadId) return;
      if (result.state === 'failed') {
        fail_loader(result.message || '章节加载失败，请重试。');
        return;
      }
      if (result.state === 'compressing') {
        compressState.value = 'compressing';
        if (result.list?.length > browseStore.imagePathList.length) {
          browseStore.imagePathList = result.list;
          emit('page_change', browseStore.page || 1);
        }
        retryId = setTimeout(() => void poll(attempt + 1), 2000);
        return;
      }
      if (result.state !== 'compressed' || !result.list?.length) {
        fail_loader('章节没有可读取的页面。');
        return;
      }
      if (browseStore.browseType === 'pdf') {
        const pdf = await imageApi.get({ file: result.list[0] });
        if (current !== loadId) return;
        browseStore.pdfPath = pdf;
      } else {
        browseStore.imagePathList = result.list;
      }
      finish_loader();
      if (browseStore.browseType !== 'pdf') emit('page_change', browseStore.page || 1);
      if (!browseStore.chapterList.length) {
        void browseStore.load_chapter_list().catch(() => {});
      }
    } catch {
      if (current === loadId) fail_loader('章节加载失败，请重试。');
    }
  };
  await poll(0);
}

function finish_loader() {
  browseStore.imageLoaded = true;
  compressState.value = 'compressed';
  stopTimers();
}

function fail_loader(message: string) {
  loadId++;
  compressState.value = 'failed';
  errorMessage.value = message;
  stopTimers();
}

// 暴露方法 刷新页码
defineExpose({
  chapter_images_load,
  finish_loader,
});
</script>

<style scoped lang="less">
// 解压缩指示器样式
.compression-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.3s ease;

  .compression-content {
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: 12px;
    padding: 24px 32px;
    display: flex;
    align-items: center;
    gap: 20px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  }

  .spinner {
    width: 36px;
    height: 36px;
    border: 3px solid rgba(255, 255, 255, 0.2);
    border-top-color: #4caf50;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .text-content {
    color: white;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .main-text {
    font-size: 18px;
    font-weight: 600;
    color: white;
  }

  .sub-text {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

// 响应式调整
@media (max-width: 768px) {
  .compression-overlay {
    .compression-content {
      padding: 20px 24px;
      gap: 16px;
    }

    .spinner {
      width: 30px;
      height: 30px;
      border-width: 2px;
    }

    .main-text {
      font-size: 16px;
    }

    .sub-text {
      font-size: 13px;
    }
  }
}
</style>
