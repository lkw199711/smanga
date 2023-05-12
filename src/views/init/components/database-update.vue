<template>
	<div class="database-update" v-loading="loading"></div>
</template>

<script setup lang="ts">
import {ref, onMounted, defineProps, defineEmits} from 'vue';
import {system_init} from '@/api/init';
import router from '@/router';

const props = defineProps(['firstLoad']);
const emit = defineEmits(['update']);

onMounted(async () => {

	const res = await system_init(props.firstLoad);
	const initCode = res.data?.initCode;

	switch (initCode) {
		case 0:
			emit('update', false, 0, '数据库链接错误');
			break;
		case 1:
			emit('update', true, 0, 'smanga初次部署，请设置数据库链接');
			break;
		case 2:
			emit('update', true, 3, '升级部署成功');
			break;
		case 3:
			router.push('/media-list');
			break;
		default:
			break;
	}
});
const loading = ref(true);
</script>

<style scoped lang="less">
.database-update {
	height: 40rem;
}
</style>
