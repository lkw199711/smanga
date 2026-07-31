<template>
  <component :is="layoutComp" />
  <!-- 主题级全局单例: toast / confirm, 三主题 + 桌面/移动共用一份 -->
  <theme-toast />
  <theme-confirm />
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { themeState } from './store'
import { resolveLayout } from './resolver'
import ThemeToast from './components/theme-toast.vue'
import ThemeConfirm from './components/theme-confirm.vue'

const layoutComp = computed(() => resolveLayout(themeState.current))
</script>
