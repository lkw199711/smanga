<template>
	<div class="right-sidebar">
		<el-drawer v-model="rightSidebarVisible" size="auto" :with-header="false">
			<!-- 安卓端占位 -->
			<android-seat />
			<el-menu class="right-sidebar-menu" active-text-color="#ffd04b" background-color="#545c64" text-color="#fff"
				@select="menu_select">
				<!--封面-->
				<img class="poster" :src="blob" alt="漫画封面" />
				<!--名称-->
				<p class="title">{{ props.mangaInfo.mangaName }}</p>
				<!--操作-->
				<!--<el-menu-item index="read"><el-icon><Memo /></el-icon>阅读</el-menu-item>-->
				<!--<el-menu-item index="collection"><el-icon><Collection /></el-icon>收藏</el-menu-item>-->
				<el-menu-item index="remove" v-if="isAdmin">
					<el-icon>
						<TopRight />
					</el-icon>
					{{ $t('option.remove') }}
				</el-menu-item>
				<el-menu-item index="delete" v-if="isAdmin">
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
				<el-menu-item index="tags" v-if="isAdmin">
					<el-icon>
						<Ticket />
					</el-icon>
					{{ $t('option.editTags') }}
				</el-menu-item>
				<el-menu-item index="scan" v-if="isAdmin">
					<el-icon>
						<Files />
					</el-icon>
					{{ $t('option.scan') }}
				</el-menu-item>
				<el-menu-item index="meta" v-if="isAdmin">
					<el-icon>
						<RefreshLeft />
					</el-icon>
					{{ $t('option.meta') }}
				</el-menu-item>
				<el-menu-item index="share" v-if="isAdmin">
					<el-icon>
						<Share />
					</el-icon>
					{{ $t('option.share') }}
				</el-menu-item>
				<el-menu-item index="edit" v-if="isAdmin">
					<el-icon>
						<Edit />
					</el-icon>
					{{ $t('rightSidebar.editManga') }}
				</el-menu-item>
			</el-menu>
		</el-drawer>

		<manga-modify v-model:editMangaDialog="editMangaDialog" :mangaInfo="props.mangaInfo" @reload="emit('reload')" />

		<el-dialog :title="$t('rightSidebar.editTags')" v-model="editTagsDialog">
			<mangaTagBox :mangaId="mangaInfo.mangaId" :tags="mangaInfo.tags" @update_tags="update_tags"
				@close_dialog="editTagsDialog = false" />
		</el-dialog>


		<el-dialog :title="$t('mangaInfo.mangaShareDialogTitle')" v-model="mangaShareDialog">
			<mangaShare :mangaInfo="mangaInfo" @close_dialog="mangaShareDialog = false" />
		</el-dialog>
	</div>
</template>

<script lang="ts" setup>
import { watch, ref, computed, onMounted, reactive } from 'vue';
import mangaApi from '@/api/manga';
import collectApi from '@/api/collect';
import i18n from '@/i18n';
import tagApi, { tagItemType } from '@/api/tag';
import historyApi from '@/api/history';
import imageApi from '@/api/image';
import useBrowseStore from '@/store/browse';
import androidSeat from '@/layout/components/android-seat.vue';
import mangaShare from '@/components/share.vue';
import { Cookies } from '@/utils';
import mangaTagBox from '../manga-info/components/manga-tag-box.vue';
import mangaModify from '../manga-manage/components/mangaModify.vue';
import { mangaType } from '@/type/manga';
const browse = useBrowseStore();
const placeholder = require('@/assets/s-blue.png');
const { t } = i18n.global;
const isCollect = ref(false);
const editTagsDialog = ref(false);
const mangaShareDialog = ref(false);
const blob = ref('');

let mangaInfo = reactive<mangaType>({
	mediaId: 0,
	mangaId: 0,
	mangaName: '',
	mangaCover: '',
	title: '',
	author: '',
	browseType: '',
	publishDate: '',
	createTime: '',
	updateTime: '',
	describe: '',
	chapterCount: 0,
	tags: [],
	metas: [],
});

const editMangaDialog = ref(false);
const rightSidebarVisible = defineModel('rightSidebarVisible');
const props = defineProps(['mangaInfo']);
const emit = defineEmits(['reload', 'close']);

const mangaId = computed(() => {
	return props.mangaInfo.mangaId;
});

const alreadyRead = computed(() => {
	return props.mangaInfo.unWatched == 0;
});

const isAdmin = computed(() => {
	return Cookies.get('role') === 'admin';
});

watch(
	() => props.mangaInfo?.mangaId,
	async (mangaId) => {
		Object.assign(mangaInfo, props.mangaInfo);
		isCollect.value = await collectApi.is_collect('manga', mangaId);
		const mangaCover = props.mangaInfo?.mangaCover;
		if (mangaCover) {
			blob.value = await imageApi.get({file: mangaCover});
		} else {
			blob.value = placeholder;
		}
	}
);

onMounted(async () => {
});

/**
 * @description: 更新漫画收藏状态
 * @return {*}
 */
async function update_collect_state() {
	isCollect.value = await collectApi.is_collect('manga', mangaId.value);
}

/**
 * @description: 更新标签状态
 * @return {*}
 */
function update_tags(tagsParams: tagItemType[]) {
	mangaInfo.tags = tagsParams;
}

/**
 * @description: 右侧菜单项选择事件
 * @param {*} key
 * @return {*}
 */
async function menu_select(key: string) {
	const mangaInfo = props.mangaInfo;
	switch (key) {
		case 'remove':
			ElMessageBox.confirm(t('mangaManage.confirm.text1'), { type: 'warning' })
				.then(async () => {
					await mangaApi.delete_manga(mangaId.value);
					emit('reload', browse.mangaListPage, browse.mangaListPageSize);
				})
				.catch();

			break;
		case 'delete':
			ElMessageBox.confirm(t('mangaManage.confirm.text2'), {
				type: 'warning',
			}).then(async () => {
				await mangaApi.delete_manga(mangaId.value, true);
				emit('reload', browse.mangaListPage, browse.mangaListPageSize);
			});

			break;
		case 'collect':
			if (isCollect.value) {
				await collectApi.remove_collect('manga', mangaId.value);
			} else {
				await collectApi.add_collect(
					Object.assign(mangaInfo, {
						collectType: 'manga',
						chapterId: -1,
						chapterName: null,
					})
				);
			}
			await update_collect_state();
			break;
		case 'alreadyRead':
			if (alreadyRead.value) {
				await historyApi.unread_all_chapters(mangaId.value);
			} else {
				await historyApi.read_all_chapters(mangaId.value);
			}
			emit('reload', browse.mangaListPage, browse.mangaListPageSize);
			break;
		case 'tags':
			editTagsDialog.value = true;
			break;
		case 'scan':
			await mangaApi.scan(mangaId.value);
			emit('reload', browse.mangaListPage, browse.mangaListPageSize);
			break;
		case 'meta':
			await mangaApi.reload_meta(mangaId.value);
			emit('reload', browse.mangaListPage, browse.mangaListPageSize);
			break;
		case 'share':
			mangaShareDialog.value = true;
			break;
		case 'edit':
			editMangaDialog.value = true;
			break;

	}
	rightSidebarVisible.value = false;
}
</script>

<style scoped lang="less" src="@/style/right-sidebar.less"></style>
