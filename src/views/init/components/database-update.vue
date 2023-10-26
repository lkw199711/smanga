<!--
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-05-03 11:35:53
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-10-26 20:18:57
 * @FilePath: \smanga\src\views\init\components\database-update.vue
-->
<template>
	<div class="database-update" v-loading="loading"></div>
</template>

<script setup lang="ts">
import {ref, onMounted, defineProps, defineEmits} from 'vue';
import deployApi from '@/api/login';

const props = defineProps(['userName', 'passWord']);
const emit = defineEmits(['update']);

onMounted(async () => {
	const res = await deployApi.system_init(props.userName, props.passWord);

	if (res.code === 0) {
		emit('update', true, 3, '升级部署成功');
	}
});
const loading = ref(true);
</script>

<style scoped lang="less">
.database-update {
	height: 40rem;
}
</style>
