<template>
  <div class="ta-layout">
    <ta-sidebar />
    <div class="ta-layout-right">
      <ta-topbar />
      <div class="ta-layout-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import TaSidebar from './sidebar.vue'
import TaTopbar from './topbar.vue'
</script>

<style scoped>
.ta-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: #fafafa;
  color: #171717;
  font-size: 14px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.ta-layout-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

.ta-layout-content {
  flex: 1;
  overflow: auto;
  padding: 24px;
}
</style>
