<template>
  <div class="cover-upload">
    <div class="upload-area">
      <div class="upload-dragger" @dragover="handleDragOver" @dragleave="handleDragLeave" @drop="handleDrop">
        <div class="upload-placeholder">
          <div class="upload-icon">
            <Upload />
          </div>
          <div class="upload-text">拖拽图片到此处，或点击上传</div>
          <div class="upload-hint">支持 JPG、PNG、GIF 等格式，文件大小不超过 10MB</div>
          <input type="file" accept="image/*" class="upload-input" @change="handleFileSelect" />
        </div>
        <div v-if="uploadFile || coverFileSrc" class="upload-preview">
          <img :src="coverFileSrc" alt="封面预览" class="upload-preview-img" />
          <div class="upload-file-info" v-if="uploadFile">
            <p>文件名: {{ uploadFile.name }}</p>
            <p>大小: {{ formatFileSize(uploadFile.size) }}</p>
            <p>类型: {{ uploadFile.type }}</p>
            <el-button type="danger" size="small" @click="removeFile">删除</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref, computed, onMounted, watch} from 'vue';
import {Upload} from '@element-plus/icons-vue';
import imageApi from '@/api/image';

// 组件属性
const props = defineProps<{
  initCover: string; // 封面路径，支持v-model
  coverType: 'media' | 'manga' | 'chapter'; // 封面类型
  bindId: number; // 目标ID
}>();

// 定义事件
const emit = defineEmits<{
  'update:value': [value: string]; // 更新外部input的值
}>();

const coverFileSrc = ref<string>('');

// 上传的文件对象
const uploadFile = ref<any>(null);

watch(
  () => props.initCover,
  async newVal => {
    coverFileSrc.value = newVal ? await imageApi.get({file: newVal}) : '';
  },
  {immediate: true}
);

// 处理文件选择
function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      ElMessage.warning('请选择有效的图片文件');
      return;
    }
    // 验证文件大小（限制为10MB）
    if (file.size > 10 * 1024 * 1024) {
      ElMessage.warning('文件大小不能超过10MB');
      return;
    }
    uploadFile.value = file;
    // 自动上传文件
    uploadImage(file);
  }
}

// 处理拖拽事件
function handleDragOver(event: DragEvent) {
  event.preventDefault();
  const dragger = event.currentTarget as HTMLElement;
  dragger.classList.add('drag-over');
}

function handleDragLeave(event: DragEvent) {
  event.preventDefault();
  const dragger = event.currentTarget as HTMLElement;
  dragger.classList.remove('drag-over');
}

function handleDrop(event: DragEvent) {
  event.preventDefault();
  const dragger = event.currentTarget as HTMLElement;
  dragger.classList.remove('drag-over');

  if (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
    const file = event.dataTransfer.files[0];
    // 检查是否为图片文件
    if (file.type.startsWith('image/')) {
      uploadFile.value = file;
      // 自动上传文件
      uploadImage(file);
    } else {
      ElMessage.warning('请选择图片文件');
    }
  }
}

// 上传图片到服务器
async function uploadImage(file: File) {
  const loading = ElLoading.service({
    lock: true,
    text: '正在上传文件，请稍候...',
    background: 'rgba(0, 0, 0, 0.7)',
  });
  try {
    // 根据不同的coverType设置不同的参数
    const params = {
      file,
      mangaId: props.coverType === 'manga' ? props.bindId.toString() : '',
      chapterId: props.coverType === 'chapter' ? props.bindId.toString() : '',
      mediaId: props.coverType === 'media' ? props.bindId.toString() : '',
    };

    const uploadResult = await imageApi.upload(params);
    // 通过emit更新外部的input值
    if (uploadResult) {
      emit('update:value', uploadResult);
      coverFileSrc.value = URL.createObjectURL(uploadFile.value);
    }
  } catch (uploadError) {
    console.error('文件上传失败:', uploadError);
  } finally {
    loading.close();
  }
}

// 移除选中的文件
function removeFile() {
  uploadFile.value = null;
  // 清空外部input值
  emit('update:value', '');
  ElMessage.success('文件已删除');
  const input = document.querySelector('.upload-input') as HTMLInputElement;
  if (input) {
    input.value = '';
  }
}

// 格式化文件大小
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
  else return (bytes / 1048576).toFixed(2) + ' MB';
}
</script>

<style lang="less" scoped>
.cover-upload {
  .upload-area {
    .upload-dragger {
      border: 2px dashed #dcdfe6;
      border-radius: 4px;
      padding: 20px;
      text-align: center;
      transition: all 0.3s;
      cursor: pointer;

      &:hover {
        border-color: #409eff;
      }

      &.drag-over {
        border-color: #67c23a;
        background-color: #f0f9ff;
      }
    }

    .upload-placeholder {
      position: relative;
      min-height: 100px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      .upload-icon {
        font-size: 36px;
        color: #c0c4cc;
        margin-bottom: 10px;
        transition: color 0.3s;
      }

      .upload-text {
        color: #909399;
        margin-bottom: 5px;
        font-size: 14px;
      }

      .upload-hint {
        color: #c0c4cc;
        font-size: 12px;
      }

      .upload-input {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        cursor: pointer;
      }
    }

    .upload-dragger:hover .upload-icon {
      color: #409eff;
    }

    .upload-preview {
      .upload-preview-img {
        max-width: 100%;
        max-height: 200px;
        margin-bottom: 10px;
        border-radius: 4px;
      }

      .upload-file-info {
        margin-bottom: 10px;
        text-align: left;

        p {
          margin: 5px 0;
          color: #606266;
          font-size: 13px;
        }
      }
    }
  }
}
</style>
