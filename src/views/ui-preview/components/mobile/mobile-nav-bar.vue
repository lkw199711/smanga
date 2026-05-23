<template>
	<nav class="mobile-nav-bar">
		<div
			v-for="item in items"
			:key="item.key"
			:class="['mnb-item', { active: activeKey === item.key }]"
			@click="handleClick(item)"
		>
			<span class="mnb-icon">{{ item.icon }}</span>
			<span class="mnb-label">{{ item.label }}</span>
		</div>
	</nav>
</template>

<script lang="ts" setup>
type NavItem = {
	key: string;
	label: string;
	icon: string;
	page?: string;
};

const props = defineProps<{
	items: NavItem[];
	activeKey: string;
}>();

const emit = defineEmits<{
	click: [item: NavItem];
}>();

function handleClick(item: NavItem) {
	emit('click', item);
}
</script>

<style scoped>
.mobile-nav-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	display: flex;
	justify-content: space-around;
	padding: 8px 0;
	background: #fff;
	border-top: 1px solid #e5e7eb;
	z-index: 100;
}

.mnb-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 4px;
	padding: 6px 12px;
	cursor: pointer;
	transition: all 0.2s;
}

.mnb-item.active {
	color: #2563eb;
}

.mnb-icon {
	font-size: 20px;
}

.mnb-label {
	font-size: 11px;
	font-weight: 500;
}
</style>
