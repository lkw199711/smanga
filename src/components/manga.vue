<template>
	<div class="manga" @click="go_chapter" v-if="viewTypeCopy !== 'list'">
		<!--封面图片-->
		<el-image
			v-if="finish"
			class="anim cover-img"
			:src="poster"
			:fit="fit"
			:alt="title" />

		<!--占位图标-->
		<el-image v-else class="cover-img" :src="placeholder" fit="fill" />

		<!--漫画名称-->
		<p class="manga-name single-line-text-overflow">{{ title }}</p>
	</div>

	<div class="manga-view-list" @click="go_chapter" v-else>
		<!--封面图片-->
		<el-image
			v-if="finish"
			class="anim cover-img"
			:src="poster"
			:fit="fit"
			:alt="title" />

		<!--占位图标-->
		<el-image v-else class="cover-img" :src="placeholder" fit="fill" />

		<!--漫画名称-->
		<p class="manga-name">{{ title }}</p>
	</div>
</template>

<script>
import {global_set} from '@/utils';

export default {
	name: 'manga-list-item',

	data() {
		return {
			placeholder: require('@/assets/s-blue.png'),
			fit: 'cover',
		};
	},

	props: ['mangaInfo', 'viewType'],

	// 引用
	computed: {
		poster() {
			return this.mangaInfo.blob;
		},
		finish() {
			return this.mangaInfo.finish;
		},
		title() {
			return this.mangaInfo.mangaName;
		},
		path() {
			return this.mangaInfo.mangaPath;
		},
		viewTypeCopy() {
			return this.viewType;
		},
	},

	methods: {
		go_chapter() {
			const mangaId = this.mangaInfo.mangaId;
			const mangaCover = this.mangaInfo.mangaCover;
			const browseType = this.mangaInfo.browseType;
			const removeFirst = this.mangaInfo.removeFirst;
			const direction = this.mangaInfo.direction;

			// 缓存漫画信息
			global_set('mangaId', mangaId);
			global_set('mangaName', this.title);
			global_set('mangaCover', mangaCover);
			global_set('removeFirst', removeFirst);
			global_set('direction', direction);

			this.$router.push({
				name: 'chapter-list',
				query: {mangaId},
				params: {browseType, clear: '1'},
			});
		},
	},
	created() {},
};
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
			height: 26rem;
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
			height: 14rem;
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
