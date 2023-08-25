<template>
	<el-menu
		:default-active="activeIndex"
		:class="['browse-top', {android: config.android}]"
		mode="horizontal"
		@select="handleSelect"
		popper-effect="light">
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
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import logo from '@/layout/components/logo.vue';
import {global_get, global_set_json, global_get_array} from '@/utils';
import {add_bookmark, delete_bookmark, get_bookmark} from '@/api/bookmark';
import {cache, config} from '@/store';
import i18n from '@/i18n';

const {t} = i18n.global;
export default defineComponent({
	name: 'browse-top',
	// 数据
	data() {
		return {
			activeIndex: '',
			config: {browseTop: true, android: false},
		};
	},

	// 传值
	props: [],

	// 计算
	computed: {
		bookmarkTitle() {
			return config.bookmarkShow
				? t('bookmarkManage.remove')
				: t('bookmarkManage.add');
		},
		browseType() {
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
		},
	},

	// 组件
	components: {logo},

	// 方法
	methods: {
		async handleSelect(key: string) {
			if (key === 'addBookmark') {
				if (config.bookmarkShow) {
					await delete_bookmark(cache.bookmarkId);
				} else {
					let page = 0;
					if (config.browseType == 'flow') {
						page = 1;
						const doms = document.getElementsByClassName('list-img');
						let minTop = 9999999;

						for (let i = 0; i < doms.length; i++) {
							const item:any = doms[i];
							const screenTop = Math.abs(item.offsetTop + item.y);

							if (screenTop < minTop) {
								minTop = screenTop;
								page = i;
							}
						}
						const loadedImages = Number(global_get('loadedImages'));
						page = loadedImages + 1 - doms.length + page;
					} else {
						// 区分单双页
						page = Number(global_get('page'));
						if (this.$route.name === 'double') {
							page = page * 2 - 1;
						}
					}

					await add_bookmark(page);
				}
				const res = await get_bookmark();

				global_set_json('bookmarkList', res.data.list);

				return;
			}

			let query = {};
			let params = {};

			// 切换浏览模式 保持参数
			if (/(flow|single|double|half)/.test(key)) {
				query = this.$route.query;
			}

			// 传参记录浏览模式
			if (key === 'chapter-list')
				Object.assign(params, {browseType: this.$route.name});

			this.$router.push({
				name: key,
				query,
				params,
			});
		},
	},

	// 生命周期
	created() {
		this.config = config;
	},
});
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

@media only screen and (min-width: 1200px) {
}

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
