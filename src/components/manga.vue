<template>
	<!-- 矩形视图 -->
	<div class="manga" @click="go_chapter" v-if="props.viewType !== 'list'">
		<!-- 未读角标 -->
		<div class="un-watched" v-show="props.mangaInfo.unWatched">{{ props.mangaInfo.unWatched }}</div>
		<!--封面图片-->
		<el-image v-if="blobLink" class="anim cover-img" :src="blobLink" :fit="fit" :alt="mangaName" />

		<!--占位图标-->
		<el-image v-else class="cover-img" :src="placeholder" fit="fill" />

		<!--漫画名称-->
		<p class="manga-name single-line-text-overflow">{{ mangaName }}</p>
	</div>

	<!-- 列表视图 -->
	<div class="manga-view-list" @click="go_chapter" v-else>
		<!--封面图片-->
		<el-image v-if="blobLink" class="anim cover-img" :src="blobLink" :fit="fit" :alt="mangaName" />

		<!--占位图标-->
		<el-image v-else class="cover-img" :src="placeholder" fit="fill" />

		<!--漫画名称-->
		<div class="manga-content">
			<p class="manga-name">{{ mangaName }}</p>
			<p class="tag-box">
				<el-tag v-for="tagItem in mangaInfo.tags" class="tag base-tag" :color="tagItem.tagColor"
					:key="tagItem.tagId">
					{{ tagItem.tagName }}
				</el-tag>
			</p>
		</div>

	</div>
</template>

<script lang="ts">
export default {
	name: 'manga-list-item'
}
</script>
<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { mangaInfoType } from '@/type/manga';
import imageApi from '@/api/image';
import { onMounted } from 'vue';
import queue from '@/store/quque';
import usePosterStore from '@/store/image';
import { userConfig } from '@/store';

type mangaItemType = mangaInfoType & { blob: string; mangaCover: string; };

const route = useRoute();
const router = useRouter();
const poster: any = usePosterStore();
// 传值
const props = defineProps(['mangaInfo', 'viewType']);
const placeholder = require('@/assets/s-blue.png');
const fit = 'cover';

let blobLink = ref('');

const mangaName = computed(() => {
	if (route.name === 'media-list') return props.mangaInfo.chapterName;
	return props.mangaInfo.mangaName;
})

onMounted(() => {
	queue.mangaQueue.add(() => get_poster(props.mangaInfo));
})

async function get_poster(item: mangaItemType) {
	blobLink.value = await imageApi.get(item.mangaCover);
}

async function go_chapter() {
	const mangaInfoPageRoute = {
		name: 'manga-info',
		query: {
			mediaId: props.mangaInfo.mediaId,
			mangaId: props.mangaInfo.mangaId,
		},
	}

	if (userConfig.openNewTab) {
		const newUrl = router.resolve(mangaInfoPageRoute);
		window.open(newUrl.href, '_blank');
	} else {
		router.push(mangaInfoPageRoute);
	}
}
</script>

<style scoped lang="less">
.manga {
	position: relative;
	cursor: pointer;

	.manga-name {
		width: 100%;
		overflow: hidden;
	}

	.un-watched {
		position: absolute;
		font-size: 1.2rem;
		width: 2rem;
		height: 2rem;
		line-height: 2rem;
		text-align: center;
		border-radius: 50%;
		background-color: @s-unread;
		color: @s-text;
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		z-index: 1;
	}
}

.manga-view-list {
	display: flex;
	margin-bottom: 1rem;

	.manga-content {
		.tag-box {
			text-indent: 0.8rem;
		}
	}
}

.cover-img {
	width: 100%;
	background-color: #f0f0f0;
	border-radius: 8px;
	box-shadow: .4rem .3rem 1rem rgb(128, 108, 108);
}

.anim {
	opacity: 0;
	animation: mymove 1s ease-in forwards;
}

@keyframes mymove {
	10% {
		opacity: 0.1;
	}

	50% {
		opacity: 0.5;
	}

	60% {
		opacity: 0.6;
	}

	90% {
		opacity: 0.9;
	}

	100% {
		opacity: 1;
	}
}

@media only screen and (min-width: 1200px) {
	.manga {
		.cover-img {
			height: 23.8rem;
		}

		.manga-name {
			margin-top: 0.6rem;
			font-size: 1.6rem;
		}
	}

	.manga-view-list {
		.cover-img {
			width: 14rem;
			min-width: 14rem;
			height: 20rem;
		}

		.manga-name {
			margin-top: 0.6rem;
			margin-left: 1rem;
			font-size: 1.6rem;
			line-height: 1.5;
		}
	}
}

@media only screen and (max-width: 1199px) and (min-width: 768px) {
	.manga {
		.cover-img {
			height: 20rem;
		}

		.manga-name {
			margin-top: 0.4rem;
			font-size: 1.6rem;
		}
	}

	.manga-view-list {
		.cover-img {
			width: 12rem;
			min-width: 12rem;
			height: 18rem;
		}

		.manga-name {
			margin-top: 0.4rem;
			margin-left: 0.8rem;
			font-size: 1.5rem;
			line-height: 1.4;
		}
	}
}

@media only screen and (max-width: 767px) {
	.manga {
		.cover-img {
			height: 16rem;
		}

		.manga-name {
			margin-top: 0.2rem;
			font-size: 1.5rem;
		}
	}

	.manga-view-list {
		.cover-img {
			width: 10rem;
			min-width: 10rem;
			height: 16rem;
		}

		.manga-name {
			margin-top: 0.2rem;
			margin-left: 0.6rem;
			font-size: 1.4rem;
			line-height: 1.3;
		}
	}
}
</style>
