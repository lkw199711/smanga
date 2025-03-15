<!--
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-09-26 02:24:07
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-09-26 11:34:16
 * @FilePath: /smanga/src/views/browse-view/components/bookmark.vue
-->
<template>
	<div class="bookmark" v-if="show">
		<i class="iconfont icon-bookmark" />
	</div>
</template>

<script lang="ts">
export default { name: 'bookmark' };
</script>
<script setup lang="ts">
import { ref, watch } from 'vue';
import useBrowseStore from '@/store/browse';

const browse = useBrowseStore();

const show = ref(false);

// 页码变更时 重新判断书签是否展示
watch(() => browse.page, () => {
	show.value = !!browse.is_on_bookmark();
}, { immediate: true });

watch(() => browse.bookmarkList, () => {
	show.value = !!browse.is_on_bookmark();
}, { immediate: true });
</script>

<style scoped lang="less">
.bookmark {
	position: fixed;
	top: 8%;
	right: 20%;
	opacity: 0.9;
	z-index: 1;

	i {
		color: @s-bookmark;
		font-size: 10rem;
	}
}
</style>
