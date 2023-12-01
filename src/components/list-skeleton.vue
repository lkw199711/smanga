<template>
    <el-skeleton :rows="skeletonRows" animated />
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const skeletonRows = ref(0);
const routeRows = computed(() => {
    const name = route.name;
    switch (name) {
        case 'search':
            return 30;
        case 'collect':
            return 30;
        default:
            return 0;
    }
})

watch(() => document.body.scrollHeight,
    (screen) => {
        const line = (screen - 60 - routeRows.value) / 32;
        skeletonRows.value = Math.floor(line) - 4;
    },
    {
        immediate: true,
    }
)

</script>