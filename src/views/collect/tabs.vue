<template>
	<div class="tabs">
		<div
			v-for="i in items"
			:key="i.value"
			:class="['tabs-item', {actived: isActived(i.value)}]"
			@click="tabs_change(i)">
			{{ $t('collect.'+i.value) }}
		</div>
	</div>
</template>

<script setup lang="ts">
import {watch, ref, computed, onMounted} from 'vue';

const props = defineProps(['items', 'modelValue']);
const emit = defineEmits(['change','update:modelValue']);

const tabsValue = computed({
	get() {
		return props.modelValue;
	},
	set(value) {
		emit('update:modelValue', value);
		emit('change', value);
	},
});

const isActived = computed(() => {
	return (itemVal: string) => {
		return tabsValue.value === itemVal;
	};
});

function tabs_change(tabVal: any) {
	tabsValue.value = tabVal.value;
}
</script>

<style scoped lang="less">
.tabs {
	display: flex;
	line-height: 4rem;
	font-size: 1.6rem;
	text-align: center;
	border: 0.2rem solid #4096ff;
	border-radius: 0.6rem;
    overflow: hidden;
	&-item {
		width: 10rem;
		cursor: pointer;
		&.actived {
			color: #fff;
			background-color: var(--el-color-primary);
		}
	}

	&:last-child {
		// border: 0;
	}
}
</style>
