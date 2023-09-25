<template>
	<!-- 矩形视图 -->
	<div class="manga" @click="go_chapter" v-if="props.viewType !== 'list'">
		<!--封面图片-->
		<el-image v-if="finish" class="anim cover-img" :src="poster" :fit="fit" :alt="mangaName" />

		<!--占位图标-->
		<el-image v-else class="cover-img" :src="placeholder" fit="fill" />

		<!--漫画名称-->
		<p class="manga-name single-line-text-overflow">{{ mangaName }}</p>
	</div>

	<!-- 列表视图 -->
	<div class="manga-view-list" @click="go_chapter" v-else>
		<!--封面图片-->
		<el-image v-if="finish" class="anim cover-img" :src="poster" :fit="fit" :alt="mangaName" />

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
import { global_set } from '@/utils';
import { computed, defineProps, defineEmits } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
// 传值
const props = defineProps(['mangaInfo', 'viewType']);
const placeholder = require('@/assets/s-blue.png');
const fit = 'cover';

const poster = computed(() => {
	return props.mangaInfo.blob;
})

const finish = computed(() => {
	return props.mangaInfo.finish;
})

const mangaName = computed(() => {
	return props.mangaInfo.mangaName;
})

function go_chapter() {
	const mangaInfo = props.mangaInfo;

	const mangaId = mangaInfo.mangaId;
	const mangaCover = mangaInfo.mangaCover;
	const browseType = mangaInfo.browseType;
	const removeFirst = mangaInfo.removeFirst;
	const direction = mangaInfo.direction;

	// 缓存漫画信息
	global_set('mangaId', mangaId);
	global_set('mangaName', mangaName);
	global_set('mangaCover', mangaCover);
	global_set('removeFirst', removeFirst);
	global_set('direction', direction);

	router.push({
		name: 'manga-info',
		query: { mangaId },
		params: { browseType, clear: '1' },
	});
}
</script>

<style scoped lang="less">
.manga {
	cursor: pointer;
	overflow: hidden;
}

.manga-view-list {
	display: flex;
	overflow: hidden;
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
