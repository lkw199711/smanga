<template>
	<div :class="['browse-top', { android: config.android }]">
		<!-- 顶部菜单 -->
		<el-menu :default-active="activeIndex" mode="horizontal" @select="handleSelect" popper-effect="light">
			<!--<logo/>-->
			<el-menu-item class="padding logo-box" index="home">
				<logo />
			</el-menu-item>
			<el-menu-item index="media-list">{{
				$t('sidebar.mediaList')
			}}</el-menu-item>
			<el-menu-item index="manga-list">{{
				$t('sidebar.mangaList')
			}}</el-menu-item>
			<el-menu-item index="chapter-list">{{
				$t('sidebar.chapterList')
			}}</el-menu-item>
			<el-sub-menu index="browse">
				<template #title>{{ browseType }}</template>
				<el-menu-item index="flow">{{ $t('browse.flow') }}</el-menu-item>
				<el-menu-item index="single">{{ $t('browse.single') }}</el-menu-item>
				<el-menu-item index="double">{{ $t('browse.double') }}</el-menu-item>
				<el-menu-item index="half">{{ $t('browse.half') }}</el-menu-item>
			</el-sub-menu>
			<el-menu-item index="right-menu">
				{{ $t('sidebar.rightMenu') }}
			</el-menu-item>
			<el-menu-item index="addBookmark">{{ bookmarkTitle }}</el-menu-item>
		</el-menu>
		<!-- 章节名称 -->
		<div class="chapter-name">{{ chapterName }}</div>
	</div>
</template>

<script lang="ts">
export default { name: 'browse-top' };
</script>
<script setup lang="ts">
import { ref, computed } from 'vue';
import logo from '@/layout/components/logo.vue';
import { config } from '@/store';
import i18n from '@/i18n';
import { useRoute, useRouter } from 'vue-router';
import useBrowseStore from '@/store/browse';
const route = useRoute();
const router = useRouter();
const browse = useBrowseStore();

const { t } = i18n.global;

let activeIndex = ref('');

let bookmarkTitle = computed(() => {
	return browse.bookmarkShow
		? t('bookmarkManage.remove')
		: t('bookmarkManage.add');
})

let browseType = computed(() => {
	switch (browse.browseType) {
		case 'flow':
			return t('browse.flow');
		case 'single':
			return t('browse.single');
		case 'double':
			return t('browse.double');
		case 'half':
			return t('browse.half');
		default:
			return t('browse.model');
	}
})

let chapterName = computed(() => browse.currentChapter?.chapterName)

async function handleSelect(key: string) {
	if (key === 'addBookmark') {
		browse.toggle_bookmark();
		return;
	}

	if (key === 'right-menu') {
		config.rightSidebar = true;
		return;
	}

	let query = {};

	// 切换浏览模式 保持参数
	if (/(flow|single|double|half)/.test(key)) {
		query = route.query;
	}

	if (key === 'media-list') {
		query = {};
	}

	if (key === 'manga-list') {
		query = {
			mediaId: route.query.mediaId
		};
	}

	if (key === 'chapter-list') {
		query = {
			mediaId: route.query.mediaId,
			mangaId: route.query.mangaId
		};
	}

	router.push({
		name: key,
		query,
	});
}
</script>

<style scoped lang="less">
.browse-top {
	position: fixed;
	width: 100%;
	background-color: @s-background;
	z-index: 1;
}

.browse-top.android {
	padding-top: 3.2rem;
}

.padding {
	padding: 0 20px 0 0;
}

.chapter-name {
	display: block;
	width: 100vw;
	height: 3.6rem;
	color: @s-text;
	background-color: @s-border;
	font-size: 1.8rem;
	text-align: center;
	line-height: 2;
	// 覆盖住el-menu的border-bottom
	transform: translateY(-1px);
}

@media only screen and (min-width: 1200px) {}

@media only screen and (max-width: 1199px) and (min-width: 768px) {
	.browse-top {
		.logo-box {
			width: 20rem;
			padding: 0;
		}
	}

	:deep(.el-menu-item) {
		padding: 0 1rem;
	}

	:deep(.el-sub-menu__title) {
		padding: 0 1rem;
	}
}

@media only screen and (max-width: 767px) {

	// 隐藏顶栏logo以节省空间
	.browse-top {
		.logo-box {
			display: none;
		}
	}

	// 顶栏间距缩小
	:deep(.el-menu-item) {
		padding: 0 0.4rem;
	}

	:deep(.el-sub-menu__title) {
		padding: 0 0.4rem;
	}
}
</style>
