<template>
	<div>
		<el-menu :default-active="activeIndex" :class="['browse-top', { android: config.android }]" mode="horizontal"
			@select="handleSelect" popper-effect="light">
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
			<el-menu-item index="addBookmark">{{ bookmarkTitle }}</el-menu-item>
		</el-menu>

		<div :class="['chapter-name', { android: config.android }]">{{ chapterName }}</div>
	</div>
</template>

<script lang="ts">
export default { name: 'browse-top' };
</script>
<script setup lang="ts">
import { ref, computed } from 'vue';
import logo from '@/layout/components/logo.vue';
import { global_get, global_set_json, global_get_array } from '@/utils';
import bookmarkApi from '@/api/bookmark';
import { cache, config, globalData } from '@/store';
import i18n from '@/i18n';
import { useRoute, useRouter } from 'vue-router';
const route = useRoute();
const router = useRouter();

const { t } = i18n.global;

let activeIndex = ref('');

let bookmarkTitle = computed(() => {
	return config.bookmarkShow
		? t('bookmarkManage.remove')
		: t('bookmarkManage.add');
})

let browseType = computed(() => {
	switch (config.browseType) {
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

let chapterName = computed(() => {
	return global_get('chapterName');
})

async function handleSelect(key: string) {
	if (key === 'addBookmark') {
		if (config.bookmarkShow) {
			await bookmarkApi.delete_and_update(cache.bookmarkId);
			return;
		}
		
		let page = global_get('page');

		if (route.name === 'double') {
			page = page * 2 - 1;
		}

		if (route.name === 'half') {
			page = Math.ceil(page / 2);
		}

		await bookmarkApi.add_bookmark(page);

		const res = await bookmarkApi.get_bookmark();

		global_set_json('bookmarkList', res.list);

		return;
	}

	let query = {};
	let params = {};

	// 切换浏览模式 保持参数
	if (/(flow|single|double|half)/.test(key)) {
		query = route.query;
	}

	// 传参记录浏览模式
	if (key === 'chapter-list')
		Object.assign(params, { browseType: route.name });

	router.push({
		name: key,
		query,
		params,
	});
}
</script>

<style scoped lang="less">
.browse-top {
	position: fixed;
	width: 100%;
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
	position: absolute;
	top: 6.2rem;
	width: 100vw;
	color: @s-text;
	background-color: @s-background;
	font-size: 1.8rem;
	text-align: center;
	line-height: 2;
}

.chapter-name.android {
	top: 9.4rem;
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
