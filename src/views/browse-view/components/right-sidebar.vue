<template>
	<div class="right-sidebar">
		<el-drawer v-model="drawer" size="auto" :with-header="false" :before-close="close_sidebar">
			<!-- 安卓端顶部占位 -->
			<div class="android-seat-top" v-if="config.android" />
			<el-menu class="right-sidebar-menu" active-text-color="#ffd04b" background-color="#545c64" text-color="#fff"
				@select="menu_select">
				<el-menu-item v-if="idDouble" index="remove-first">{{
					removeFirstTitle
					}}</el-menu-item>
				<el-menu-item index="bookmark">{{ bookmarkTitle }}</el-menu-item>
				<el-menu-item v-if="idDouble" index="direction">{{ $t('option.direction') }} ({{ directionTitle
					}})</el-menu-item>
				<el-menu-item index="dwonload">{{
					$t('option.dwonload')
					}}</el-menu-item>
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

const browse = useBrowseStore();

const { t } = i18n.global;

const route = useRoute();

const drawer = ref(false);

const props = defineProps(['rightSidebar', 'direction', 'removeFirst']);
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
	return route.name === 'double';
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
			if (document.documentElement.requestFullscreen) {
				document.documentElement.requestFullscreen();
			} else if (document.documentElement.webkitRequestFullscreen) {
				document.documentElement.webkitRequestFullscreen();
			} else if (document.documentElement.mozRequestFullScreen) {
				document.documentElement.mozRequestFullScreen();
			} else if (document.documentElement.msRequestFullscreen) {
				document.documentElement.msRequestFullscreen();
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
