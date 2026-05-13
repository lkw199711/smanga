<template>
  <div class="tb-layout">
    <tb-sidebar />
    <div class="tb-layout-right">
      <tb-topbar />
      <div class="tb-layout-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import TbSidebar from './sidebar.vue'
import TbTopbar from './topbar.vue'
</script>

<style scoped>
.tb-layout {
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