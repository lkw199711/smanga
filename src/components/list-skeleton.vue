<template>
    <el-skeleton :rows="skeletonRows" animated />
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

const props = withDefaults(defineProps<{ rows?: number }>(), { rows: 0 });
const viewportHeight = ref(typeof window === 'undefined' ? 720 : window.innerHeight);

const skeletonRows = computed(() => {
    if (props.rows > 0) return Math.floor(props.rows);
    return Math.max(6, Math.floor((viewportHeight.value - 160) / 32));
});

function updateViewportHeight() {
    viewportHeight.value = window.visualViewport?.height || window.innerHeight;
}

onMounted(() => {
    updateViewportHeight();
    window.addEventListener('resize', updateViewportHeight);
    window.visualViewport?.addEventListener('resize', updateViewportHeight);
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', updateViewportHeight);
    window.visualViewport?.removeEventListener('resize', updateViewportHeight);
});
</script>
