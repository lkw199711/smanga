<!--
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-09-26 02:24:07
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-09-26 11:34:16
 * @FilePath: /smanga/src/views/browse-view/components/bookmark.vue
-->
<template>
	<div class="bookmark" v-if="browse.bookmarkShow">
		<i class="iconfont icon-bookmark" />
	</div>
</template>

<script lang="ts">
export default { name: 'bookmark' };
</script>
<script setup lang="ts">
import useBrowseStore from '@/store/browse';

const browse = useBrowseStore();
;
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
