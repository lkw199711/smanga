<template>
	<el-result
		icon="success"
		title="初始化升级成功"
		:sub-title="`将在${second}秒后进入默认页面`">
		<template #extra>
			<el-button type="primary" @click="go_default_page">直接进入</el-button>
		</template>
	</el-result>
</template>

<script setup lang="ts">
import {ref, onBeforeUnmount, defineProps, defineEmits} from 'vue';
import {useRouter} from 'vue-router';

const router = useRouter();
const second = ref(10);

const interval = setInterval(() => {
	second.value--;
	if (second.value < 1) {
		clearInterval(interval);
        go_default_page();
	}
}, 1000);

function go_default_page() {
    router.push('/media-list');
}

onBeforeUnmount(() => {
	clearInterval(interval);
});
</script>

<style scoped lang="less"></style>
