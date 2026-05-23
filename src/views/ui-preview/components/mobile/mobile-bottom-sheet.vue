<template>
	<div v-if="visible" class="mobile-bottom-sheet" @click.self="close">
		<div class="mbs-backdrop" @click="close"></div>
		<div class="mbs-content">
			<div class="mbs-header">
				<h3>{{ title }}</h3>
				<button class="mbs-close" @click="close">×</button>
			</div>
			<div class="mbs-body">
				<slot></slot>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
const props = defineProps<{
	visible: boolean;
	title?: string;
}>();

const emit = defineEmits<{
	close: [];
}>();

function close() {
	emit('close');
}
</script>

<style scoped>
.mobile-bottom-sheet {
	position: fixed;
	inset: 0;
	z-index: 1000;
	display: flex;
	align-items: flex-end;
}

.mbs-backdrop {
	position: absolute;
	inset: 0;
	background: rgba(0, 0, 0, 0.5);
}

.mbs-content {
	position: relative;
	width: 100%;
	max-height: 80vh;
	background: #fff;
	border-radius: 16px 16px 0 0;
	overflow: hidden;
	animation: slideUp 0.3s ease;
}

.mbs-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16px 20px;
	border-bottom: 1px solid #e5e7eb;
}

.mbs-header h3 {
	margin: 0;
	font-size: 16px;
	font-weight: 600;
}

.mbs-close {
	width: 32px;
	height: 32px;
	border: none;
	background: transparent;
	font-size: 24px;
	cursor: pointer;
	color: #6b7280;
}

.mbs-body {
	padding: 16px 20px;
	overflow-y: auto;
	max-height: calc(80vh - 60px);
}

@keyframes slideUp {
	from {
		transform: translateY(100%);
	}
	to {
		transform: translateY(0);
	}
}
</style>
