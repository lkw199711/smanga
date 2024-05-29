<!--
 * @Author: 梁楷文 lkw199711@163.com
 * @Date: 2024-04-05 03:53:27
 * @LastEditors: 梁楷文 lkw199711@163.com
 * @LastEditTime: 2024-05-29 09:47:18
 * @FilePath: \smanga\src\views\init\components\result.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
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
import {ref, onBeforeUnmount } from 'vue';
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
