<template>
	<div class="index">
		<div class="manga-list">
			<div class="title">继续阅读</div>
			<div :class="['manga-list-box', { block: config.viewType === 'list' }]">
				<manga v-for="item in lastReadList" :key="item.lastReadId" :viewType="config.viewType" :mangaInfo="item" />
			</div>
		</div>

		<div class="media">
			<div class="media-item" v-for="item in mediaList" :key="item.mediaId" @click="go_manga_list(item.mediaId)"
				@contextmenu.prevent="context_menu">
				{{ item.mediaName }}
			</div>
		</div>
	</div>
</template>

<script lang="ts">
export default { name: 'media-list' };
</script>
<script setup lang="ts">
import { ref,onMounted, onBeforeUnmount } from 'vue';
import { get_media } from '@/api/media';
import { global_set } from '@/utils';
import store, { config } from '@/store';
import lastReadApi from '@/api/last-read';
import { get_poster } from '@/api';
import manga from '@/components/manga.vue';
import { useRoute, useRouter } from 'vue-router';
import { mediaType } from '@/type/media';
import { lastReadType } from '@/type/last-read';
const route = useRoute();
const router = useRouter();

const mediaList = ref<mediaType[]>([]);
const lastReadList = ref<lastReadType[]>([]);

/**
 * @description: 读取媒体库
 * @return {*}
 */
async function load_media() {
	const res = await get_media(1, 10000);
	mediaList.value = res.data.list.data;
}

/**
 * @description: 跳转漫画列表
 * @param {*} mediaId
 * @return {*}
 */
function go_manga_list(mediaId: number) {
	// 设置媒体库id
	global_set('mediaId', mediaId);

	router.push({
		name: 'manga-list',
		query: {
			mediaId,
		},
		params: { clear: '1' },
	});
}

/**
 * @description: 上下文菜单
 * @return {*}
 */
function context_menu() {
	config.rightSidebar = true;
}

// 生命周期
onMounted(async () => {
	lastReadList.value = await lastReadApi.get();

	// 为漫画请求海报图片
	get_poster(lastReadList.value, 'mangaAwait');

	store.commit('switch_await', { running: 'mangaAwait', bool: true });

	load_media();
})

onBeforeUnmount(() => {
	store.commit('switch_await', { running: 'mangaAwait', bool: false });
})

</script>

<style scoped lang="less">
.title {
	font-size: 2rem;
	text-indent: 2rem;
	margin-top: 1rem;
}

.media {
	display: grid;
	justify-content: space-between;

	&-item {
		text-align: center;
		background-color: @s-background;
		color: @s-text;
		box-shadow: #9a6e3a 1px 2px 4px;
		cursor: pointer;
	}
}

@media only screen and (min-width: 1200px) {
	.media {
		margin: 6rem auto;
		padding: 0 6rem;
		grid-template-columns: repeat(auto-fill, 20rem);
		grid-gap: 3rem 3rem;

		&-item {
			line-height: 14rem;
			border-radius: 1.4rem;
			font-size: 2rem;
		}
	}
}

@media only screen and (max-width: 1199px) and (min-width: 768px) {
	.media {
		margin: 4rem auto;
		padding: 0 4rem;
		grid-template-columns: repeat(auto-fill, 14rem);
		grid-gap: 2rem 2rem;

		&-item {
			line-height: 10rem;
			border-radius: 1.2rem;
			font-size: 1.6rem;
		}
	}
}

@media only screen and (max-width: 767px) {
	.media {
		margin: 2rem auto;
		padding: 0 2rem;
		grid-template-columns: repeat(auto-fill, 10rem);
		grid-gap: 1.6rem 1rem;

		&-item {
			line-height: 7rem;
			border-radius: 1rem;
			font-size: 1.4rem;
		}
	}
}
</style>

<style src="@/style/manga-list.less" scoped lang="less"></style>
