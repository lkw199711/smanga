<template>
	<div class="right-sidebar">
		<el-drawer
			v-model="drawer"
			size="auto"
			:with-header="false"
			:before-close="close_sidebar">
			<el-menu
				class="right-sidebar-menu"
				active-text-color="#ffd04b"
				background-color="#545c64"
				text-color="#fff"
				@select="menu_select">
				<!--封面-->
				<img class="poster" :src="blob" alt="漫画封面" />
				<!--名称-->
				<p class="title">{{ mangaName }}</p>
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
			</el-menu>
		</el-drawer>
	</div>
</template>

<script lang="ts" setup>
import {watch, ref, defineProps, defineEmits, computed, onMounted} from 'vue';
import {useRoute} from 'vue-router';
import {config} from '@/store';
import {delete_manga} from '@/api/manga';
import {
	get_collect,
	add_collect,
	is_collect,
	remove_collect,
} from '@/api/collect';
import {ElMessageBox} from 'element-plus';
import i18n from '@/i18n';
const {t} = i18n.global;

const route = useRoute();

const drawer = ref(false);
const isCollect = ref(false);

const props = defineProps(['mangaInfo', 'menuPoster']);
const emit = defineEmits(['reload']);

const mangaName = computed(() => {
	return props.mangaInfo.mangaName;
});

const mangaId = computed(() => {
	return props.mangaInfo.mangaId;
});

const blob = computed(() => {
	return props.menuPoster;
});

watch(
	() => config.rightSidebar,
	(val) => {
		drawer.value = val;
	}
);

watch(
	() => props.mangaInfo.mangaId,
	async (val) => {
		const res = await is_collect('manga', val);
		isCollect.value = res.data.isCollect;
	}
);

onMounted(async () => {
	const res = await is_collect('manga', mangaId.value);
	const isCollect = res.data.isCollect;
});

async function update_collect_state() {
	const res = await is_collect('manga', mangaId.value);
	isCollect.value = res.data.isCollect;
}

function close_sidebar() {
	config.rightSidebar = false;
}

async function menu_select(key: string) {
	const mangaInfo = props.mangaInfo;
	switch (key) {
		case 'remove':
			ElMessageBox.confirm(t('mangaManage.confirm.text1'), {type: 'warning'})
				.then(async () => {
					await delete_manga(mangaId.value);
					emit('reload');
				})
				.catch();

			break;
		case 'delete':
			ElMessageBox.confirm(t('mangaManage.confirm.text2'), {
				type: 'warning',
			}).then(async () => {
				await delete_manga(mangaId.value, true);
				emit('reload');
			});

			break;
		case 'collect':
			if (isCollect.value) {
				await remove_collect('manga', mangaId.value);
			} else {
				await add_collect(
					Object.assign(mangaInfo, {
						collectType: 'manga',
						chapterId: -1,
						chapterName: null,
					})
				);
			}
			update_collect_state();
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
