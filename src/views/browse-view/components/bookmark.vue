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
import { defineProps, computed } from 'vue';
import { global_get_array, global_get } from '@/utils';
import { config, cache } from '@/store';
import { useRoute, useRouter } from 'vue-router';
const route = useRoute();
const router = useRouter();

const props = defineProps(['page', 'chapterId']);

let show = computed(() => {
	let page = props.page;

	if (route.name === 'double') {
		page = page * 2 - 1;
	}

	if (route.name === 'half') {
		page = Math.ceil(page / 2);
	}

	const bookmarkList = global_get_array('bookmarkList');
	const chapterId = props.chapterId;

	// 通过章节与页码判断书签展示
	for (let i = 0; i < bookmarkList.length; i++) {
		const item = bookmarkList[i];

		if (chapterId != item.chapterId) {
			continue;
		}
		
		if (item.page == page) {
			cache.bookmarkId = item.bookmarkId;
			config.bookmarkShow = true;
			return true;
		}

		// switch (config.browseType) {
		// 	case 'double':
		// 		if (item.page == page || item.page == page + 1) {
		// 			cache.bookmarkId = item.bookmarkId;
		// 			config.bookmarkShow = true;
		// 			return true;
		// 		}
		// 		break;
		// 	case 'half':
		// 		if (item.page == page || item.page == page + 1) {
		// 			cache.bookmarkId = item.bookmarkId;
		// 			config.bookmarkShow = true;
		// 			return true;
		// 		}
		// 		break;
		// 	default:
		// 		if (item.page == page) {
		// 			cache.bookmarkId = item.bookmarkId;
		// 			config.bookmarkShow = true;
		// 			return true;
		// 		}
		// 		break;
		// }
	}

	config.bookmarkShow = false;
	return false;
})
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
