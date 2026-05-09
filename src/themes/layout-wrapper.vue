<template>
  <component :is="layoutComp" />
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { themeState } from './store'
import { resolveLayout } from './resolver'

const layoutComp = computed(() => resolveLayout(themeState.current))
</script>
