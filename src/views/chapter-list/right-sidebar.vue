<template>
	<div class="right-sidebar">
		<el-drawer v-model="props.rightSidebarVisible" size="auto" :with-header="false" :before-close="close_sidebar">
			<!-- 安卓端顶部占位 -->
			<div class="android-seat-top" v-if="config.android" />
			<el-menu class="right-sidebar-menu" active-text-color="#ffd04b" background-color="#545c64" text-color="#fff"
				@select="menu_select">
				<!--封面-->
				<img class="poster" :src="blob" alt="漫画封面" />
				<!--名称-->
				<p class="title">{{ props.chapterInfo?.chapterName }}</p>
				<!--操作-->
				<!--<el-menu-item index="read"><el-icon><Memo /></el-icon>阅读</el-menu-item>-->
				<!--<el-menu-item index="collection"><el-icon><Collection /></el-icon>收藏</el-menu-item>-->
				<el-menu-item index="remove">
					<el-icon>
						<TopRight />
					</el-icon>
					{{ $t('option.remove') }}
				</el-menu-item>
				<el-menu-item index="delete">
					<el-icon>
						<Delete />
					</el-icon>
					{{ $t('option.delete') }}
				</el-menu-item>
				<el-menu-item index="collect">
					<el-icon>
						<StarFilled v-if="isCollect" />
						<Star v-else />
					</el-icon>
					{{ isCollect ? $t('option.removeCollect') : $t('option.collect') }}
				</el-menu-item>
				<el-menu-item index="alreadyRead">
					<el-icon>
						<Notebook />
					</el-icon>
					{{ alreadyRead ? $t('option.markAsUnRead') : $t('option.markAsRead') }}
				</el-menu-item>
			</el-menu>
		</el-drawer>
	</div>
</template>

<script lang="ts" setup>
import { watch, ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { config } from '@/store';
import chapterApi from '@/api/chapter';
import { ElMessageBox } from 'element-plus';
import i18n from '@/i18n';
import collectApi from '@/api/collect';
import imageApi from '@/api/image';
import historyApi from '@/api/history';
import latestApi from '@/api/latest';
import useBrowseStore from '@/store/browse';
const browse = useBrowseStore();
const placeholder = require('@/assets/s-blue.png');
const { t } = i18n.global;
const isCollect = ref(false);
const blob = ref('');
const props = defineProps(['chapterInfo', 'rightSidebarVisible']);
const emit = defineEmits(['reload', 'close']);
const alreadyRead = computed(() => {
	return props.chapterInfo?.latest?.finish;
});

const chapterId = computed(() => {
	return props.chapterInfo.chapterId;
});

watch(
	() => props.chapterInfo?.chapterId,
	async (chapterId) => {
		isCollect.value = await collectApi.is_collect('chapter', chapterId);
		const chapterCover = props.chapterInfo?.chapterCover;
		if (chapterCover) {
			blob.value = await imageApi.get(chapterCover);
		} else {
			blob.value = placeholder;
		}
	}
);

function close_sidebar() {
	emit('close');
}

async function menu_select(key: string) {
	const chapterInfo = props.chapterInfo;

	switch (key) {
		case 'remove':
			ElMessageBox.confirm(t('chapterManage.confirm.text1'), {
				type: 'warning',
			}).then(async () => {
				await chapterApi.delete_chapter(chapterId.value);
				emit('reload', browse.chapterListPage, browse.chapterListPageSize);
			});

			break;
		case 'delete':
			ElMessageBox.confirm(t('chapterManage.confirm.text2'), {
				type: 'warning',
			}).then(async () => {
				await chapterApi.delete_chapter(chapterId.value, true);
				emit('reload', browse.chapterListPage, browse.chapterListPageSize);
			});
			break;
		case 'collect':
			if (isCollect.value) {
				await collectApi.remove_collect('chapter', chapterId.value);
			} else {
				await collectApi.add_collect(
					Object.assign(chapterInfo, {
						collectType: 'chapter',
					})
				);
			}
			// 更新收藏状态
			isCollect.value = await collectApi.is_collect('chapter', chapterId.value);
			break;
		case 'alreadyRead':
			if (alreadyRead.value) {
				await historyApi.delete(chapterId.value);
				await latestApi.delete(chapterId.value);
			} else {
				await historyApi.add(chapterInfo);
				await latestApi.add({
					chapterId: chapterId.value,
					mangaId: chapterInfo.mangaId,
					finish: true,
					page: 0,
					count: 0,
				});
			}
			emit('reload', browse.chapterListPage, browse.chapterListPageSize);
			break;
	}
	close_sidebar();
}
</script>

<style scoped lang="less">
.right-sidebar-menu {
	width: 32rem;
	max-width: 70vw;
	height: 100%;
	background-color: #545c64;
}

.poster {
	width: 100%;
	max-height: 50%;
	object-fit: cover;
}

.title {
	padding: 1rem 1rem 2rem;
	color: @button-back;
	font-size: 1.6rem;
}
</style>
