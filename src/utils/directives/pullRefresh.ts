import {Directive} from 'vue';

// 下拉刷新指令配置接口
interface PullRefreshOptions {
  /** 刷新时的回调函数 */
  onRefresh: () => Promise<void> | void;
  /** 触发刷新的阈值距离(px)，默认60 */
  threshold?: number;
  /** 最大下拉距离(px)，默认120 */
  maxDistance?: number;
  /** 下拉阻力系数，值越大越难下拉，默认0.5 */
  resistance?: number;
}

// 创建下拉刷新指令
const pullRefresh: Directive = {
  mounted(el, binding) {
    // 获取配置项
    const options: PullRefreshOptions =
      typeof binding.value === 'function'
        ? {onRefresh: binding.value}
        : {
            onRefresh: () => {},
            threshold: 60,
            maxDistance: 120,
            resistance: 0.5,
            ...binding.value,
          };

    const {onRefresh, threshold = 60, maxDistance = 120, resistance = 0.5} = options;

    // 状态变量
    let startY = 0;
    let currentY = 0;
    let pullingDistance = 0;
    let isPulling = false;
    let isRefreshing = false;
    let scrollTop = 0;
    let originalTransition = '';

    // 创建加载动画元素
    const spinner = document.createElement('div');
    spinner.className = 'pull-refresh-spinner';
    spinner.innerHTML = `
      <div class="spinner-icon"></div>
      <div class="spinner-text">下拉刷新</div>
    `;
    spinner.style.cssText = `
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
    `;

    // 添加spinner样式
    const style = document.createElement('style');
    style.textContent = `
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
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);

    // 初始化DOM结构
    el.style.position = 'relative';
    el.style.overflow = 'hidden';

    // 创建内容容器
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'pull-refresh-wrapper';
    contentWrapper.style.cssText = `
      width: 100%;
      transition: transform 0.3s;
      will-change: transform;
    `;

    // 移动原始内容到wrapper中
    while (el.firstChild) {
      contentWrapper.appendChild(el.firstChild);
    }

    el.appendChild(spinner);
    el.appendChild(contentWrapper);

    // 获取滚动元素
    const getScrollElement = () => {
      // 尝试获取子元素中的滚动容器
      let scrollEl = el.querySelector('.scroll') as HTMLElement;
      if (!scrollEl) {
        // 如果没有特定的滚动元素，使用wrapper
        scrollEl = contentWrapper;
        scrollEl.style.overflowY = 'auto';
        scrollEl.style.height = '100%';
      }
      return scrollEl;
    };

    const scrollEl = getScrollElement();

    // 更新滚动位置
    const updateScrollTop = () => {
      scrollTop = scrollEl.scrollTop || 0;
    };

    // 开始下拉
    const startPull = (y: number) => {
      // 获取文档元素的滚动高度
      const documentScrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      // 只有当组件滚动高度和文档滚动高度都为0且不在刷新状态时才能开始下拉
      if (isRefreshing || scrollTop > 0 || documentScrollTop > 0) {
        return;
      }

      startY = y;
      isPulling = true;
      originalTransition = contentWrapper.style.transition;
      contentWrapper.style.transition = '';
    };

    // 正在下拉
    const doPull = (y: number) => {
      if (!isPulling || isRefreshing) return;

      currentY = y;
      const distance = (currentY - startY) * resistance;

      if (distance > 0 && scrollTop <= 0) {
        // 阻止默认滚动
        event?.preventDefault?.();

        pullingDistance = Math.min(distance, maxDistance);
        contentWrapper.style.transform = `translateY(${pullingDistance}px)`;
        spinner.style.transform = `translateY(${pullingDistance}px)`;

        // 根据距离更新状态
        if (pullingDistance > threshold) {
          spinner.classList.add('pulling');
          spinner.querySelector('.spinner-text')!.textContent = '释放刷新';
        } else {
          spinner.classList.remove('pulling');
          spinner.querySelector('.spinner-text')!.textContent = '下拉刷新';
        }
      }
    };

    // 结束下拉
    const endPull = async () => {
      if (!isPulling || isRefreshing) return;

      isPulling = false;
      contentWrapper.style.transition = originalTransition || 'transform 0.3s';

      // 判断是否触发刷新
      if (pullingDistance > threshold) {
        await triggerRefresh();
      } else {
        // 复位
        resetPosition();
      }
    };

    // 触发刷新
    const triggerRefresh = async () => {
      isRefreshing = true;
      spinner.classList.add('refreshing');
      spinner.classList.remove('pulling');
      spinner.querySelector('.spinner-text')!.textContent = '刷新中...';

      // 保持一定高度显示刷新状态
      contentWrapper.style.transform = `translateY(50px)`;
      spinner.style.transform = `translateY(50px)`;

      try {
        // 执行刷新回调
        await Promise.resolve(onRefresh());
      } finally {
        // 无论成功失败都复位
        setTimeout(() => {
          resetPosition();
          isRefreshing = false;
          spinner.classList.remove('refreshing');
          spinner.querySelector('.spinner-text')!.textContent = '下拉刷新';
        }, 500);
      }
    };

    // 复位位置
    const resetPosition = () => {
      contentWrapper.style.transform = '';
      spinner.style.transform = '';
      pullingDistance = 0;
    };

    // 绑定事件监听器
    const handleMouseDown = (e: MouseEvent) => {
      startPull(e.clientY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      doPull(e.clientY);
    };

    const handleMouseUp = () => {
      endPull();
    };

    const handleTouchStart = (e: TouchEvent) => {
      startPull(e.touches[0].clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      doPull(e.touches[0].clientY);
    };

    const handleTouchEnd = () => {
      endPull();
    };

    // 监听滚动事件以更新scrollTop
    scrollEl.addEventListener('scroll', updateScrollTop);

    // 绑定鼠标事件（PC端）
    el.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // 绑定触摸事件（移动端）
    el.addEventListener('touchstart', handleTouchStart, {passive: false});
    el.addEventListener('touchmove', handleTouchMove, {passive: false});
    el.addEventListener('touchend', handleTouchEnd);

    // 存储事件处理器以便后续清理
    (el as any).__pullRefreshHandlers = {
      handleMouseDown,
      handleMouseMove,
      handleMouseUp,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
      updateScrollTop,
    };
  },

  unmounted(el) {
    // 清理事件监听器
    const handlers = (el as any).__pullRefreshHandlers;
    if (handlers) {
      el.removeEventListener('mousedown', handlers.handleMouseDown);
      document.removeEventListener('mousemove', handlers.handleMouseMove);
      document.removeEventListener('mouseup', handlers.handleMouseUp);
      el.removeEventListener('touchstart', handlers.handleTouchStart);
      el.removeEventListener('touchmove', handlers.handleTouchMove);
      el.removeEventListener('touchend', handlers.handleTouchEnd);

      const scrollEl = el.querySelector('.scroll') || el.querySelector('.pull-refresh-wrapper');
      if (scrollEl) {
        scrollEl.removeEventListener('scroll', handlers.updateScrollTop);
      }
    }

    // 移除样式元素
    const styleElements = document.head.querySelectorAll('style');
    styleElements.forEach(style => {
      if (style.textContent?.includes('.pull-refresh-spinner')) {
        document.head.removeChild(style);
      }
    });
  },
};

export default pullRefresh;
