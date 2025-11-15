<template>
	<div :class="['chapter', sourceWebsite]">
		<div class="chapter-image-box">
			<!--封面图片-->
			<el-image v-if="blobLink" class="anim chapter-cover-img" :src="blobLink" :fit="fit" :alt="chapterName" />
			<!--占位图标-->
			<el-image v-else :src="placeholder" class="chapter-cover-img" fit="fill" />

			<el-image v-if="blobLink1" class="anim chapter-cover-img" :src="blobLink1" :fit="fit" :alt="chapterName" />
		</div>

		<!-- 章节序号 -->
		<p class="chapter-index">{{ chapterInfo.chapterNumber }}</p>

		<!--章节名称-->
		<p class="chapter-name single-line-text-overflow">{{ chapterName }}</p>

		<!--已读图标-->
		<i :class="['iconfont', 'icon-success-fill', 'icon-is-read', { 'is-show': isRead }]" />

		<!-- 阅读进度 -->
		<el-progress class="progress" :percentage="percentage" :show-text="false" v-if="percentage" />
	</div>
</template>

<script lang="ts">
export default { name: 'manga-chapter-item' }
</script>
<script lang="ts" setup>
import imageApi from "@/api/image";
import queue from "@/store/quque";
import { chapterType } from "@/type/chapter";
import { getFileNameWithoutExtension } from "@/utils";
import { ref, onMounted, computed } from "vue";

type chapterItemType = chapterType & { blob: string; chapterCover: string; pageImage: string; };
const props = defineProps(['chapterInfo', 'bookmark', 'sourceWebsite']);
const placeholder = require("@/assets/s-blue.png");
const fit = 'cover';
let blobLink = ref('');
let blobLink1 = ref('');
const chapterName = ref(props.chapterInfo.chapterName);

const percentage = computed(() => {
	const latest = props.chapterInfo?.latest;
	if (!latest) {
		return false;
	}

	if (latest.finish) {
		return false;
	}

	if (latest?.page && latest?.count) {
		return (latest.page / latest.count) * 100;
	}

	return false;
});

const isRead = computed(() => {
	const latest = props.chapterInfo?.latest;
	return latest?.finish;
});

onMounted(() => {
	queue.mangaQueue.add(() => get_poster(props.chapterInfo));
})

async function get_poster(item: chapterItemType) {
	const coverPath = item.chapterCover || item.pageImage;
	// const coverBaseName = getFileNameWithoutExtension(coverPath);
	// const coverExt = coverPath.split('.').pop() || 'jpg';
	blobLink.value = await imageApi.get({file: coverPath});
	if (props.sourceWebsite === 'toptoon') {
		const chapterBaseName = getFileNameWithoutExtension(props.chapterInfo.chapterPath);
		blobLink1.value = await imageApi.get({file: chapterBaseName + '-1.jpg'});
	}
}

</script>

<style scoped lang="less">
.chapter {
	position: relative;
	overflow: hidden;
	cursor: pointer;
	display: flex;
	justify-content: space-between;
	gap: 1rem;
	padding: .6rem;
	padding-right: 1.4rem;
	border: 2px solid #ccc;
	border-radius: 1rem;

	width: 100%;
	max-width: 100%;
	height: 9rem;

	&-cover-img {
		margin-right: .4rem;
		height: 100%;
		position: relative;
		background-color: #f0f0f0;
	}

	&-image-box {
		position: relative;
		border-radius: 8px;
	}

	.progress {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 0.2rem;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 1;
	}

	.chapter-index,
	.chapter-name {
		margin-top: .6rem;
		line-height: 1.6;
		font-size: 1.6rem;
		max-width: 42%;
		white-space: normal;
	}
}

.chapter.toptoon {
	.chapter-image-box {
		min-width: 21.2rem;
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

.icon-is-read {
	color: @s-isread;
	height: 4rem;
	font-size: 4rem;
	overflow: hidden;
	border-radius: 100%;
	background-color: #fff;
	z-index: 1;
	opacity: 0;
	transform: translateY(2rem);

	&.is-show {
		opacity: 1;
	}
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

@media screen {}

@media only screen and (min-width: 1920px) {
	.chapter {
		width: 70rem;
	}

	.chapter.toomics {
		height: 9.6rem;
	}

	.chapter.toptoon {
		height: 14.1rem;
	}
}

@media only screen and (max-width: 1919px) and (min-width: 1200px) {
	.chapter {
		width: 49rem;
	}

	.chapter.toomics {
		height: 9.6rem;
	}

	.chapter.toptoon {
		height: 14.1rem;
	}

	.icon-is-read {
		height: 3.4rem;
		font-size: 3.4rem;
		transform: translateY(2.6rem);
	}
}

@media only screen and (max-width: 1199px) and (min-width: 768px) {
	.chapter.toomics {
		height: 9.6rem;
	}

	.chapter.toptoon {
		height: 14.1rem;
	}

	.chapter {

		.chapter-index,
		.chapter-name {
			margin-top: .6rem;
			line-height: 1.6;
			font-size: 1.6rem;
		}
	}

	.icon-is-read {
		transform: translateY(3rem);
	}
}

@media only screen and (max-width: 767px) {
	.chapter.toomics {
		height: 6rem;
	}

	.chapter.toptoon {
		height: 11rem;

		.chapter-image-box {
			min-width: 17rem;
		}
	}

	.chapter {
		height: 6rem;
		padding-right: 1rem;

		.chapter-index,
		.chapter-name {
			margin-top: .4rem;
			line-height: 1.4;
			font-size: 1.4rem;
		}
	}

	.icon-is-read {
		height: 2.4rem;
		font-size: 2.4rem;
		transform: translateY(1.6rem);
	}
}
</style>
