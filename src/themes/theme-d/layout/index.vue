<template>
  <div class="td-layout" :data-color="colorScheme">
    <td-sidebar />
    <div class="td-layout-right">
      <td-topbar />
      <div class="td-layout-content"><router-view /></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, provide } from 'vue'
import TdSidebar from './sidebar.vue'
import TdTopbar from './topbar.vue'

const colorScheme = ref(localStorage.getItem('td-color') || 'blue')
provide('td-color', colorScheme)
provide('td-set-color', (c: string) => { colorScheme.value = c; localStorage.setItem('td-color', c) })
</script>

<style scoped>
.td-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  font-size: 14px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', sans-serif;
  --bg: #f8f9fa; --bg2: #fff; --fg: #2d3436; --fg2: #636e72; --border: #e9ecef; --accent: #6c5ce7; --accent-soft: rgba(108,92,231,0.1);
  background: var(--bg); color: var(--fg);
}
.td-layout[data-color="blue"] { --accent: #0984e3; --accent-soft: rgba(9,132,227,0.1); }
.td-layout[data-color="pink"] { --accent: #e84393; --accent-soft: rgba(232,67,147,0.1); }
.td-layout[data-color="green"] { --accent: #00b894; --accent-soft: rgba(0,184,148,0.1); }
.td-layout[data-color="purple"] { --accent: #6c5ce7; --accent-soft: rgba(108,92,231,0.1); }
.td-layout[data-color="orange"] { --accent: #e17055; --accent-soft: rgba(225,112,85,0.1); }
.td-layout[data-color="dark"] { --bg: #1a1a2e; --bg2: #16213e; --fg: #e0e0e0; --fg2: #a0a0a0; --border: #2a2a4a; --accent: #6c5ce7; --accent-soft: rgba(108,92,231,0.15); }
.td-layout[data-color="mint"] { --accent: #00cec9; --accent-soft: rgba(0,206,201,0.1); }
.td-layout[data-color="rose"] { --accent: #fd79a8; --accent-soft: rgba(253,121,168,0.1); }
.td-layout[data-color="amber"] { --accent: #fdcb6e; --accent-soft: rgba(253,203,110,0.1); }

.td-layout-right { flex: 1; display: flex; flex-direction: column; min-width: 0; overflow: hidden; }
.td-layout-content { flex: 1; overflow: auto; padding: 24px; background: var(--bg); }
</style>
