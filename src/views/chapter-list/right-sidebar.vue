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
				<p class="title">{{ chapterName }}</p>
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
import {watch, ref, defineProps, defineEmits, computed} from 'vue';
import {useRoute} from 'vue-router';
import {config} from '@/store';
import {delete_chapter} from '@/api/chapter';
import {ElMessageBox} from 'element-plus';
import i18n from '@/i18n';
import {add_collect, is_collect, remove_collect} from '@/api/collect';

const {t} = i18n.global;

const route = useRoute();

const drawer = ref(false);
const isCollect = ref(false);

const props = defineProps(['info', 'menuPoster']);
const emit = defineEmits(['reload']);

const chapterName = computed(() => {
	return props.info.chapterName;
});

const chapterId = computed(() => {
	return props.info.chapterId;
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
	() => props.info.chapterId,
	async (val) => {
		const res = await is_collect('chapter', val);
		isCollect.value = res.data.request;
	}
);

function close_sidebar() {
	config.rightSidebar = false;
}

async function update_collect_state() {
	const res = await is_collect('chapter', chapterId.value);
	isCollect.value = res.data.request;
}

async function menu_select(key: string) {
	const chapterInfo = props.info;

	switch (key) {
		case 'remove':
			ElMessageBox.confirm(t('chapterManage.confirm.text1'), {
				type: 'warning',
			}).then(async () => {
				await delete_chapter(chapterId.value);
				emit('reload');
			});

			break;
		case 'delete':
			ElMessageBox.confirm(t('chapterManage.confirm.text2'), {
				type: 'warning',
			}).then(async () => {
				await delete_chapter(chapterId.value, true);
				emit('reload');
			});
			break;
		case 'collect':
			if (isCollect.value) {
				await remove_collect('chapter', chapterId.value);
			} else {
				await add_collect(
					Object.assign(chapterInfo, {
						collectType: 'chapter',
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
