<template>
  <div class="finish-indicator" :class="{ show: visible }">
    <button class="next-chapter-btn" @click="$emit('nextChapter')">
      <div class="btn-content">
        <div class="next-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
          </svg>
        </div>
        <div class="btn-text">{{ $t('browse.nextChapter') }}</div>
      </div>
    </button>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits } from 'vue';

// 定义组件属性
defineProps<{
  visible: boolean;
}>();

// 定义组件事件
defineEmits<{
  (e: 'nextChapter'): void;
}>();
</script>

<style scoped lang="less">
.finish-indicator {
  position: fixed;
  bottom: 8rem;
  right: 3rem;
  z-index: 1000;
  opacity: 0;
  transform: translateY(2rem);
  transition: all 0.3s ease;
  pointer-events: none;
  
  &.show {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }
  
  .next-chapter-btn {
    background: linear-gradient(135deg, #4CAF50, #45a049);
    border: none;
    border-radius: 50px;
    padding: 14px 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 10px 30px rgba(76, 175, 80, 0.3);
    transition: all 0.3s ease;
    animation: float 3s ease-in-out infinite;
    
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 35px rgba(76, 175, 80, 0.4);
      background: linear-gradient(135deg, #45a049, #3d8b40);
    }
    
    &:active {
      transform: translateY(-1px);
    }
    
    .btn-content {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .next-icon {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }
    
    .btn-text {
      font-size: 16px;
      font-weight: 600;
      color: white;
      white-space: nowrap;
    }
  }
}

@keyframes float {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
  100% {
    transform: translateY(0);
  }
}

// 响应式调整
@media (max-width: 768px) {
  .finish-indicator {
    bottom: 20px;
    right: 20px;
    
    .next-chapter-btn {
      padding: 12px 20px;
      
      .next-icon {
        width: 18px;
        height: 18px;
        
        svg {
          width: 16px;
          height: 16px;
        }
      }
      
      .btn-text {
        font-size: 14px;
      }
    }
  }
}
</style>