<template>
  <component :is="readerComp" />
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { themeState } from './store'
import { resolveReaderLayout } from './resolver'

const readerComp = computed(() => resolveReaderLayout(themeState.current))
</script>
