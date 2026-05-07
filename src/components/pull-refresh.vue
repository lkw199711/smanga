<template>
  <div class="pull-refresh-container" ref="container">
    <!-- 加载动画元素 -->
    <div 
      class="pull-refresh-spinner" 
      :class="{ 'refreshing': isRefreshing, 'pulling': pullingDistance > threshold }"
      :style="{ transform: `translateY(${pullingDistance}px)` }"
    >
      <div class="spinner-icon"></div>
      <div class="spinner-text">{{ spinnerText }}</div>
    </div>
    
    <!-- 内容容器 -->
    <div 
      class="pull-refresh-content" 
      :style="{ transform: `translateY(${pullingDistance}px)` }"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';

// 定义组件属性
interface Props {
  /** 刷新时的回调函数 */
  onRefresh: () => Promise<void> | void;
  /** 触发刷新的阈值距离(px)，默认60 */
  threshold?: number;
  /** 最大下拉距离(px)，默认120 */
  maxDistance?: number;
  /** 下拉阻力系数，值越大越难下拉，默认0.5 */
  resistance?: number;
}

const props = withDefaults(defineProps<Props>(), {
  threshold: 60,
  maxDistance: 120,
  resistance: 0.5
});

// 状态变量
const container = ref<HTMLElement>();
const startY = ref(0);
const currentY = ref(0);
const pullingDistance = ref(0);
const isPulling = ref(false);
const isRefreshing = ref(false);
const scrollTop = ref(0);
const originalTransition = ref('');

// 计算加载文本
const spinnerText = computed(() => {
  if (isRefreshing.value) return '刷新中...';
  if (pullingDistance.value > props.threshold) return '释放刷新';
  return '下拉刷新';
});

// 获取滚动元素
const getScrollElement = () => {
  if (!container.value) return null;
  
  // 尝试获取子元素中的滚动容器
  let scrollEl = container.value.querySelector('.scroll') as HTMLElement;
  if (!scrollEl) {
    // 如果没有特定的滚动元素，使用内容容器
    scrollEl = container.value.querySelector('.pull-refresh-content') as HTMLElement;
    if (scrollEl) {
      scrollEl.style.overflowY = 'auto';
      scrollEl.style.height = '100%';
    }
  }
  return scrollEl;
};

// 更新滚动位置
const updateScrollTop = () => {
  const scrollEl = getScrollElement();
  if (scrollEl) {
    scrollTop.value = scrollEl.scrollTop || 0;
  }
};

// 开始下拉
const startPull = (y: number) => {
  if (isRefreshing.value || scrollTop.value > 0) return;
  
  startY.value = y;
  isPulling.value = true;
  
  const content = container.value?.querySelector('.pull-refresh-content') as HTMLElement | null;
  if (content) {
    originalTransition.value = content.style.transition;
    content.style.transition = '';
  }
};

// 正在下拉
const doPull = (y: number, e: Event) => {
  if (!isPulling.value || isRefreshing.value) return;
  
  currentY.value = y;
  const distance = (currentY.value - startY.value) * props.resistance;
  
  if (distance > 0 && scrollTop.value <= 0) {
    // 阻止默认滚动和拖拽行为
    e.preventDefault();
    
    pullingDistance.value = Math.min(distance, props.maxDistance);
  }
};

// 结束下拉
const endPull = async () => {
  if (!isPulling.value || isRefreshing.value) return;
  
  isPulling.value = false;
  
  const content = container.value?.querySelector('.pull-refresh-content') as HTMLElement | null;
  if (content) {
    content.style.transition = originalTransition.value || 'transform 0.3s';
  }
  
  // 判断是否触发刷新
  if (pullingDistance.value > props.threshold) {
    await triggerRefresh();
  } else {
    // 复位
    resetPosition();
  }
};

// 触发刷新
const triggerRefresh = async () => {
  isRefreshing.value = true;
  
  // 保持一定高度显示刷新状态
  pullingDistance.value = 50;
  
  try {
    // 执行刷新回调
    await Promise.resolve(props.onRefresh());
  } finally {
    // 无论成功失败都复位
    setTimeout(() => {
      resetPosition();
      isRefreshing.value = false;
    }, 500);
  }
};

// 复位位置
const resetPosition = () => {
  pullingDistance.value = 0;
};

// 事件处理器
const handleMouseDown = (e: MouseEvent) => {
  // 阻止事件冒泡，防止子元素触发父元素的拖拽事件
  e.stopPropagation();
  startPull(e.clientY);
};

const handleMouseMove = (e: MouseEvent) => {
  // 阻止事件冒泡
  e.stopPropagation();
  doPull(e.clientY, e);
};

const handleMouseUp = (e: MouseEvent) => {
  // 阻止事件冒泡
  e.stopPropagation();
  endPull();
};

const handleTouchStart = (e: TouchEvent) => {
  // 阻止事件冒泡，防止子元素触发父元素的拖拽事件
  e.stopPropagation();
  startPull(e.touches[0].clientY);
};

const handleTouchMove = (e: TouchEvent) => {
  // 阻止事件冒泡
  e.stopPropagation();
  doPull(e.touches[0].clientY, e);
};

const handleTouchEnd = (e: TouchEvent) => {
  // 阻止事件冒泡
  e.stopPropagation();
  endPull();
};

// 生命周期钩子
onMounted(() => {
  if (!container.value) return;
  
  const scrollEl = getScrollElement();
  if (scrollEl) {
    // 监听滚动事件以更新scrollTop
    scrollEl.addEventListener('scroll', updateScrollTop);
  }
  
  // 绑定鼠标事件（PC端）
  container.value.addEventListener('mousedown', handleMouseDown);
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
  
  // 绑定触摸事件（移动端）
  container.value.addEventListener('touchstart', handleTouchStart, { passive: false });
  container.value.addEventListener('touchmove', handleTouchMove, { passive: false });
  container.value.addEventListener('touchend', handleTouchEnd);
});

onUnmounted(() => {
  if (!container.value) return;
  
  // 清理事件监听器
  container.value.removeEventListener('mousedown', handleMouseDown);
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
  container.value.removeEventListener('touchstart', handleTouchStart);
  container.value.removeEventListener('touchmove', handleTouchMove);
  container.value.removeEventListener('touchend', handleTouchEnd);
  
  const scrollEl = getScrollElement();
  if (scrollEl) {
    scrollEl.removeEventListener('scroll', updateScrollTop);
  }
});
</script>

<style scoped>
.pull-refresh-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.pull-refresh-spinner {
  position: absolute;
  top: -50px;
  left: 0;
  right: 0;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  transition: transform 0.3s;
}

.pull-refresh-spinner .spinner-icon {
  width: 20px;
  height: 20px;
  border: 2px solid #ccc;
  border-top-color: #666;
  border-radius: 50%;
  margin-right: 8px;
  transition: transform 0.3s;
}

.pull-refresh-spinner.refreshing .spinner-icon {
  animation: spin 1s linear infinite;
}

.pull-refresh-spinner.pulling .spinner-icon {
  transform: rotate(180deg);
}

.pull-refresh-spinner .spinner-text {
  font-size: 14px;
  color: #666;
}

.pull-refresh-content {
  width: 100%;
  height: 100%;
  transition: transform 0.3s;
  will-change: transform;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>