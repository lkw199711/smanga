<template>
	<div class="chapter" v-if="viewType !== 'list'">
		<!--封面图片-->
		<el-image v-if="blobLink" class="anim chapter-cover-img" :src="blobLink" :fit="fit" :alt="chapterName" />

		<!--占位图标-->
		<el-image v-else :src="placeholder" class="chapter-cover-img" fit="fill" />

		<!--书签图标-->
		<i class="iconfont icon-Bookmark- icon-bookmark" v-if="bookmark" />

		<!--章节名称-->
		<p class="chapter-name single-line-text-overflow">{{ chapterName }}</p>
	</div>

	<div class="chapter-view-list" v-else>
		<!--封面图片-->
		<el-image v-if="blobLink" class="anim chapter-cover-img" :src="blobLink" :fit="fit" :alt="chapterName" />

		<!--占位图标-->
		<el-image v-else :src="placeholder" class="chapter-cover-img" fit="fill" />

		<!--书签图标-->
		<i class="iconfont icon-Bookmark- icon-bookmark" v-if="bookmark" />

		<!--章节名称-->
		<p class="chapter-name">{{ chapterName }}</p>
	</div>
</template>

<script lang="ts">
export default { name: 'manga-chapter-item' }
</script>
<script lang="ts" setup>
import imageApi from "@/api/image";
import queue from "@/store/quque";
import { chapterInfoType } from "@/type/chapter";
import { ref, onMounted } from "vue";
import usePosterStore from '@/store/poster';

type chapterItemType = chapterInfoType & { blob: string; chapterCover: string; pageImage: string; };
const poster: any = usePosterStore();
const props = defineProps(['chapterInfo', 'bookmark', 'viewType']);
const placeholder = require("@/assets/s-blue.png");
const fit = 'cover';
let blobLink = ref('');
const chapterName = ref(props.chapterInfo.chapterName);
let viewType = ref(props.chapterInfo.viewType);

onMounted(() => {
	queue.mangaQueue.add(() => get_poster(props.chapterInfo));
})

async function get_poster(item: chapterItemType) {
	const coverName = item.pageImage || item.chapterCover;
	if (poster[coverName]) {
		blobLink.value = poster[coverName]
	} else {
		blobLink.value = await imageApi.get(coverName);
		poster[coverName] = blobLink.value;
	}
}

</script>

<style scoped lang="less">
.chapter {
	position: relative;
	overflow: hidden;
	cursor: pointer;

	&-cover-img {
		width: 100%;
		background-color: #f0f0f0;
		border-radius: 8px;
	}
}

.chapter-view-list {
	position: relative;
	display: flex;
	margin-bottom: 1rem;
}

.anim {
	opacity: 0;
	animation: mymove 1s ease-in forwards;
}

.icon-bookmark {
	position: absolute;
	top: 0;
	left: 0;
	color: @s-bookmark;
	font-size: 2rem;
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
	.chapter {
		.chapter-cover-img {
			height: 24rem;
		}

		.chapter-name {
			margin-top: 0.6rem;
		}

		.icon-bookmark {
			font-size: 4rem;
		}
	}

	.chapter-view-list {
		.chapter-cover-img {
			width: 12rem;
			min-width: 12rem;
			height: 16rem;
		}

		.chapter-name {
			margin-top: 0.4rem;
			margin-left: 1rem;
			font-size: 1.6rem;
			line-height: 1.5;
		}

		.icon-bookmark {
			font-size: 4rem;
		}
	}
}

@media only screen and (max-width: 1199px) and (min-width: 768px) {
	.chapter {
		.chapter-cover-img {
			height: 18rem;
		}

		.chapter-name {
			margin-top: 0.4rem;
			font-size: 1.4rem;
		}

		.icon-bookmark {
			font-size: 3rem;
		}
	}

	.chapter-view-list {
		.chapter-cover-img {
			width: 10rem;
			min-width: 10rem;
			height: 14rem;
		}

		.chapter-name {
			margin-top: 0.4rem;
			margin-left: .8rem;
			font-size: 1.5rem;
			line-height: 1.4;
		}

		.icon-bookmark {
			font-size: 3rem;
		}
	}
}

@media only screen and (max-width: 767px) {
	.chapter {
		.chapter-cover-img {
			height: 12.6rem;
		}

		.chapter-name {
			margin-top: 0.2rem;
		}

		.icon-bookmark {
			font-size: 2.4rem;
		}
	}

	.chapter-view-list {
		.chapter-cover-img {
			width: 8rem;
			min-width: 8rem;
			height: 12rem;
		}

		.chapter-name {
			margin-top: 0.2rem;
			margin-left: .6rem;
			font-size: 1.4rem;
			line-height: 1.3;
		}

		.icon-bookmark {
			font-size: 3rem;
		}
	}
}
</style>
