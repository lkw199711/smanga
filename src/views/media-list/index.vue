<template>
	<div class="index">
		<div class="media">
			<div class="media-item" v-for="item in mediaList" :key="item.mediaId" @click="go_manga_list(item)"
				@contextmenu.prevent="context_menu">
				<!--封面图片-->
				<el-image v-if="item.mediaCoverLink" class="anim chapter-cover-img" :src="item.mediaCoverLink" fit="fit"
					:alt="item.mediaName" />

				<!--占位图标-->
				<el-image v-else :src="placeholder" class="chapter-cover-img" fit="fill" />

				<!--媒体库名称-->
				<p class="media-name">{{ item.mediaName }}</p>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
export default { name: 'media-list' };
</script>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import mediaApi from '@/api/media';
import { config, userConfig } from '@/store';
import { useRoute, useRouter } from 'vue-router';
import { mediaType } from '@/type/media';
import imageApi from '@/api/image';
import useBrowseStore from '@/store/browse';
const browse = useBrowseStore();
const placeholder = require('@/assets/s-blue.png');
const route = useRoute();
const router = useRouter();

const mediaList = ref<mediaType[]>([]);

/**
 * @description: 读取媒体库
 * @return {*}
 */
async function load_media() {
	const res = await mediaApi.get(1, 10000);

	mediaList.value = res.list;
	mediaList.value.forEach(async (item: mediaType) => {
		item.mediaCoverLink = await imageApi.get(item.mediaCover);
	});
}

/**
 * @description: 跳转漫画列表
 * @param {*} mediaId
 * @return {*}
 */
function go_manga_list(mediaInfo: mediaType) {
	let newPageRoute = {};
	if (mediaInfo.mediaType === 1 && userConfig.singleMediadirectChapterPage) {
		browse.chapterListPage = 1;
		newPageRoute = {
			name: 'chapter-list',
			query: {
				mediaId: mediaInfo.mediaId,
			}
		};
	} else {
		browse.mangaListPage = 1;
		const mediaId = mediaInfo.mediaId;
		newPageRoute = {
			name: 'manga-list',
			query: {
				mediaId,
			}
		};
	}

	if (userConfig.openNewTab) {
		// 使用新标签页打开
		window.open(router.resolve(newPageRoute).href, '_blank');
	} else {
		// 在当前标签页打开
		router.push(newPageRoute);
	}
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
	load_media();
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
		overflow: hidden;
	}

	&-name {
		z-index: 50;
	}

	.chapter-cover-img {
		overflow: hidden;
	}
}

@media only screen and (min-width: 1200px) {
	.media {
		margin: 6rem auto;
		padding: 0 6rem;
		grid-template-columns: repeat(auto-fill, 24.6rem);
		grid-gap: 3rem 3rem;

		&-item {
			height: 13.2rem;
			border-radius: 1.4rem;
		}

		&-name {
			margin-top: 1rem;
			font-size: 2rem;
		}
	}

	.chapter-cover-img {
		max-height: 9rem;
	}
}

@media only screen and (max-width: 1199px) and (min-width: 768px) {
	.media {
		margin: 4rem auto;
		padding: 0 4rem;
		grid-template-columns: repeat(auto-fill, 20rem);
		grid-gap: 3rem 2rem;

		&-item {
			height: 11.6rem;
			border-radius: 1.2rem;
		}

		&-name {
			margin-top: 1rem;
			font-size: 1.8rem;
		}
	}

	.chapter-cover-img {
		max-height: 7.4rem;
	}
}

@media only screen and (max-width: 767px) {
	.media {
		margin: 2rem auto;
		padding: 0 2rem;
		grid-template-columns: repeat(auto-fill, 16rem);
		grid-gap: 2rem 1rem;

		&-item {
			height: 9.6rem;
			border-radius: 1rem;
		}

		&-name {
			margin-top: 1rem;
			font-size: 1.4rem;
		}
	}

	.chapter-cover-img {
		max-height: 6rem;
	}
}
</style>