<template>
  <!-- 解压缩状态指示器 -->
  <div v-if="compressState !== 'compressed'" class="compression-overlay">
    <div class="compression-content">
      <div class="spinner"></div>
      <div class="text-content">
        <div class="main-text">{{ compressStateTipText[compressState] }}</div>
        <div class="sub-text">{{ `${reTry * 2}/20 秒` }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import chapterApi from '@/api/chapter';
import useBrowseStore from '@/store/browse';
import { useRoute } from 'vue-router';

const route = useRoute();
const browseStore = useBrowseStore();
const reTry = ref(0);
const compressState = ref('loadingImages');
defineProps({
  compressState: {
    type: String,
    default: 'loadingImages',
  },
});

const emit = defineEmits(['page_change']);

const compressStateTipText = {
  loadingImages: '加载中',
  compressing: '压缩中',
  compressed: '压缩完成',
  failed: '压缩失败',
};

onMounted(() => {
    const chapterId = Number(route.query.chapterId);
  chapter_images_compress(chapterId);
});

async function chapter_images_compress(chapterId: number) {
  const res = await chapterApi.get_images(chapterId, reTry.value);
  compressState.value = res.state;
  switch (res.state) {
    case 'compressing':
      reTry.value++;
      setTimeout(() => chapter_images_compress(chapterId), 2000);
      break;
    case 'compressed':
      // 压缩完成 加载图片并隐藏指示器
      browseStore.imagePathList = res.list;
      emit('page_change', browseStore.page || 1);
      break;
    case 'failed':
      // 压缩失败 提示用户并隐藏指示器
      break;
    default:
      break;
  }
}
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
