<template>
	<div class="chapter" v-if="viewTypeCopy !== 'list'">
		<!--封面图片-->
		<el-image
			v-if="finish"
			class="anim chapter-cover-img"
			:src="poster"
			:fit="fit"
			:alt="chapterName"
		/>

		<!--占位图标-->
		<el-image v-else :src="placeholder" class="chapter-cover-img" fit="fill" />

		<!--书签图标-->
		<i class="iconfont icon-Bookmark- icon-bookmark" v-if="bookmark" />

		<!--章节名称-->
		<p class="chapter-name single-line-text-overflow">{{ chapterName }}</p>
	</div>

	<div class="chapter-view-list" v-else>
		<!--封面图片-->
		<el-image
			v-if="finish"
			class="anim chapter-cover-img"
			:src="poster"
			:fit="fit"
			:alt="chapterName"
		/>

		<!--占位图标-->
		<el-image v-else :src="placeholder" class="chapter-cover-img" fit="fill" />

		<!--书签图标-->
		<i class="iconfont icon-Bookmark- icon-bookmark" v-if="bookmark" />

		<!--章节名称-->
		<p class="chapter-name">{{ chapterName }}</p>
	</div>
</template>

<script lang="ts">
	import { defineComponent } from "vue";

	export default defineComponent({
		name: "manga-chapter-item",
		// 数据
		data() {
			return {
				placeholder: require("@/assets/s-blue.png"),
				fit: "cover",
			};
		},

		// 传值
		props: ["chapterInfo", "bookmark", "viewType"],

		// 引用
		computed: {
			poster() {
				return this.chapterInfo.blob;
			},
			finish() {
				return this.chapterInfo.finish;
			},
			chapterName() {
				return this.chapterInfo.chapterName;
			},
			viewTypeCopy() {
				return this.viewType;
			},
		},

		// 组件
		components: {},

		// 方法
		methods: {},

		// 生命周期
		created() {},
	});
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
				height: 12rem;
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
