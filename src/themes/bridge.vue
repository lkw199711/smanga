<template>
  <component :is="comp" />
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { themeState } from './store'
import { resolvePage } from './resolver'

const props = defineProps<{ page: string }>()

const comp = computed(() => resolvePage(themeState.current, props.page))
</script>
