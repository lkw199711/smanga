<template>
	<div class="bookmark" v-if="show">
		<i class="iconfont icon-bookmark" />
	</div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {global_get_array, global_get} from '@/utils';
import {config, cache} from '@/store';

export default defineComponent({
	name: 'bookmark',
	// 数据
	data() {
		return {};
	},

	// 传值
	props: ['chapterId'],

	// 计算
	computed: {
		show() {
			let page = 0;
			if (config.browseType == 'flow') {
				page = 1;
				const doms = document.getElementsByClassName('list-img');
				let minTop = 9999999;

				for (let i = 0; i < doms.length; i++) {
					const item: any = doms[i];

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

			const bookmarkList = global_get_array('bookmarkList');
			const chapterId = this.chapterId;
			// 通过章节与页码判断书签展示
			for (let i = 0; i < bookmarkList.length; i++) {
				const item = bookmarkList[i];
				if (item.chapterId == chapterId) {
					if (
						(config.browseType === 'single' && item.page == page) ||
						(config.browseType === 'double' &&
							(item.page == page || item.page == page + 1)) ||
						(config.browseType === 'flow' && item.page == page - 1)
					) {
						cache.bookmarkId = item.bookmarkId;
						config.bookmarkShow = true;
						return true;
					}
				}
			}

			config.bookmarkShow = false;
			return false;
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
.bookmark {
	position: absolute;
	top: 8%;
	right: 20%;
	opacity: 0.9;
	z-index: 1;

	i {
		color: @s-bookmark;
		font-size: 10rem;
	}
}
</style>
