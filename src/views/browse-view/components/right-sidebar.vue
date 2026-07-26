<template>
	<div class="right-sidebar">
		<el-drawer
			v-model="drawer"
			size="auto"
			:with-header="false"
			:before-close="close_sidebar"
			append-to-body
			:z-index="3000"
			modal-class="right-sidebar-drawer-modal"
			class="right-sidebar-drawer"
		>
			<android-seat />
			<el-menu class="right-sidebar-menu" active-text-color="#ffd04b" background-color="#545c64" text-color="#fff"
				@select="menu_select">
				<el-menu-item index="chapter-list">
					<i class="iconfont icon-menu" style="margin-right: 0.6rem;" />{{ $t('sidebar.chapterList') || '章节列表' }}
				</el-menu-item>
				<el-menu-item v-if="idDouble" index="remove-first">{{ removeFirstTitle }}</el-menu-item>
				<el-menu-item index="bookmark">{{ bookmarkTitle }}</el-menu-item>
				<el-menu-item v-if="idDouble" index="direction">{{ $t('option.direction') }} ({{ directionTitle }})</el-menu-item>
				<el-menu-item index="dwonload">{{ $t('option.dwonload') }}</el-menu-item>
				<el-menu-item index="operation">{{ operationText }}</el-menu-item>
				<el-menu-item index="jump">{{ $t('rightSidebar.jumpPageText') }}</el-menu-item>
				<el-menu-item index="setImageWidth">{{ $t('rightSidebar.setImageWidth') }}</el-menu-item>
				<el-menu-item index="requestFullscreen">{{ $t('rightSidebar.requestFullscreen') }}</el-menu-item>
				<el-menu-item index="exitFullscreen">{{ $t('rightSidebar.exitFullscreen') }}</el-menu-item>
			</el-menu>
		</el-drawer>
	</div>
</template>

<script lang="ts" setup>
import { watch, ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { config } from '@/store';
import i18n from '@/i18n';
import useBrowseStore from '@/store/browse';
import androidSeat from '@/layout/components/android-seat.vue';

const browse = useBrowseStore();

const { t } = i18n.global;

const route = useRoute();

const drawer = ref(false);

const props = defineProps({
	rightSidebar: null,
	direction: null,
	removeFirst: null,
});
const emit = defineEmits([
	'contextMenu',
	'direction',
	'remove_first',
	'dwonload',
	'jumpPageNumber',
	'set_image_width',
]);

const removeFirstTitle = computed(() => {
	return props.removeFirst
		? t('option.recoveryFirst')
		: t('option.removeFirst');
});

const bookmarkTitle = computed(() => {
	return browse.bookmarkShow
		? t('bookmarkManage.remove')
		: t('bookmarkManage.add');
});

const directionTitle = computed(() => {
	return props.direction ? t('option.rtl') : t('option.ltr');
});

const idDouble = computed(() => {
	return browse.browseType === 'double';
});

const operationText = computed(() => {
	return config.enableOperation ? '关闭操作面板' : '开启操作面板';
})

watch(
	() => config.rightSidebar,
	(val) => {
		drawer.value = val;
	}
);

function close_sidebar() {
	config.rightSidebar = false;
}

function menu_select(key: string) {
	switch (key) {
		case 'chapter-list':
			config.rightSidebar = false;
			(config as any).chapterList = true;
			return;
		case 'bookmark':
			browse.toggle_bookmark();
			break;
		case 'direction':
			emit('direction');
			break;
		case 'remove-first':
			emit('remove_first');
			break;
		case 'dwonload':
			emit('dwonload');
			break;
		case 'operation':
			config.enableOperation = !config.enableOperation;
			break;
		case 'jump':
			emit('jumpPageNumber');
			break;
		case 'setImageWidth':
			emit('set_image_width');
			break;
		case 'requestFullscreen':
			{
				const docEl = document.documentElement as HTMLElement & {
					webkitRequestFullscreen?: () => Promise<void>;
					mozRequestFullScreen?: () => Promise<void>;
					msRequestFullscreen?: () => Promise<void>;
				};
				if (docEl.requestFullscreen) {
					docEl.requestFullscreen();
				} else if (docEl.webkitRequestFullscreen) {
					docEl.webkitRequestFullscreen();
				} else if (docEl.mozRequestFullScreen) {
					docEl.mozRequestFullScreen();
				} else if (docEl.msRequestFullscreen) {
					docEl.msRequestFullscreen();
				}
			}
			break;
		case 'exitFullscreen':
			if (document.fullscreenElement) {
				document.exitFullscreen();
			}
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
</style>

<!-- append-to-body 后 el-drawer 挂到 body, 保证覆盖 imagesLoader 的 z-index:2000 -->
<style lang="less">
.right-sidebar-drawer-modal {
	z-index: 3000 !important;
}
.right-sidebar-drawer {
	z-index: 3001 !important;
}
</style>