<template>
  <div class="tb-layout">
    <tb-sidebar />
    <div class="tb-layout-right">
      <tb-topbar />
      <div class="tb-layout-content">
        <router-view :key="refreshKey" />
      </div>
    </div>
    <theme-context-menu />
  </div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import TbSidebar from './sidebar.vue'
import TbTopbar from './topbar.vue'
import ThemeContextMenu from '@/themes/components/theme-context-menu.vue'

const refreshKey = ref(0)
function refreshPage() { refreshKey.value += 1 }
onMounted(() => window.addEventListener('smanga:theme-context-menu-changed', refreshPage))
onBeforeUnmount(() => window.removeEventListener('smanga:theme-context-menu-changed', refreshPage))
</script>

<style scoped>
.tb-layout {
	--tcm-bg: rgba(255, 255, 255, .96);
	--tcm-text: #1f2937;
	--tcm-border: rgba(0, 0, 0, .1);
	--tcm-hover: #f8e7f0;
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #fff5fa 0%, #eef4ff 50%, #f5ecff 100%);
  color: #1f2937;
  font-size: 14px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  position: relative;
}

.tb-layout-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  padding: 16px;
}

.tb-layout-content {
  flex: 1;
  overflow: auto;
  padding: 0;
}
</style>
