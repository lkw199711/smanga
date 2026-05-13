<template>
	<div class="manage-b">
		<header class="mb-header">
			<h1 class="mb-title">📚 漫画管理</h1>
			<div class="mb-stats-row">
				<span class="mb-stat-chip">共 {{ manageMock.totalCount }} 部</span>
				<span class="mb-stat-chip">🔥 今日新增 12</span>
			</div>
		</header>

		<!-- 工具栏 -->
		<div class="mb-toolbar">
			<div class="mb-search">
				<span>🔍</span>
				<input placeholder="搜索你的漫画…" v-model="keyword" />
			</div>
			<div class="mb-actions">
				<button class="mb-pill">🔄 刷新</button>
				<button class="mb-pill danger">🗑 删除</button>
			</div>
		</div>

		<!-- 卡片列表 -->
		<div class="mb-cards">
			<div v-for="row in filteredData" :key="row.mangaId" class="mb-card">
				<div class="mb-card-left">
					<div class="mb-card-id">#{{ row.mangaId }}</div>
					<div class="mb-card-name">{{ row.mangaName }}</div>
					<div class="mb-card-meta">
						<span>媒体库 {{ row.mediaId }}</span>
						<span>{{ row.updateTime }}</span>
					</div>
				</div>
				<div class="mb-card-actions">
					<button class="mb-card-btn">✏️ 编辑</button>
					<button class="mb-card-btn danger">🗑</button>
				</div>
			</div>
		</div>

		<!-- 分页 -->
		<div class="mb-pager">
			<button class="mb-page-btn">← 上一页</button>
			<span class="mb-page-info">第 1 / 128 页</span>
			<button class="mb-page-btn">下一页 →</button>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { manageMock } from '../mock';

const keyword = ref('');
const filteredData = computed(() => {
	if (!keyword.value) return manageMock.tableData;
	return manageMock.tableData.filter(r => r.mangaName.includes(keyword.value));
});
</script>

<style scoped>
.manage-b {
	min-height: calc(100vh - 65px);
	background: linear-gradient(135deg, #fff5fa 0%, #eef4ff 50%, #f5ecff 100%);
	color: #1f2937;
	font-size: 14px;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
	padding: 28px;
}

.mb-header {
	margin-bottom: 20px;
}

.mb-title {
	font-size: 22px;
	font-weight: 800;
	background: linear-gradient(135deg, #ff6fa3, #6c8dff);
	-webkit-background-clip: text;
	background-clip: text;
	color: transparent;
	margin: 0 0 8px;
}

.mb-stats-row {
	display: flex;
	gap: 8px;
}

.mb-stat-chip {
	padding: 4px 12px;
	font-size: 12px;
	font-weight: 500;
	background: rgba(255, 255, 255, 0.8);
	border-radius: 999px;
	color: #4b5563;
}

.mb-toolbar {
	display: flex;
	align-items: center;
	gap: 16px;
	margin-bottom: 20px;
}

.mb-search {
	flex: 1;
	max-width: 400px;
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 10px 16px;
	background: rgba(255, 255, 255, 0.72);
	backdrop-filter: blur(12px);
	border: 1px solid rgba(255, 255, 255, 0.9);
	border-radius: 999px;
}

.mb-search input {
	flex: 1;
	border: none;
	outline: none;
	background: transparent;
	font-size: 13px;
}

.mb-actions {
	display: flex;
	gap: 8px;
}

.mb-pill {
	padding: 9px 18px;
	font-size: 13px;
	font-weight: 500;
	background: rgba(255, 255, 255, 0.72);
	border: 1px solid rgba(255, 255, 255, 0.9);
	border-radius: 999px;
	cursor: pointer;
	color: #4b5563;
}

.mb-pill:hover { background: #fff; }
.mb-pill.danger { color: #dc2626; }

.mb-cards {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.mb-card {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16px 20px;
	background: rgba(255, 255, 255, 0.72);
	backdrop-filter: blur(12px);
	border: 1px solid rgba(255, 255, 255, 0.8);
	border-radius: 16px;
	transition: all 0.2s;
	box-shadow: 0 4px 12px rgba(108, 141, 255, 0.06);
}

.mb-card:hover {
	transform: translateY(-2px);
	box-shadow: 0 8px 24px rgba(255, 111, 163, 0.12);
}

.mb-card-id {
	font-size: 11px;
	font-weight: 600;
	color: #6c8dff;
	margin-bottom: 2px;
}

.mb-card-name {
	font-size: 15px;
	font-weight: 700;
	color: #1f2937;
	margin-bottom: 4px;
}

.mb-card-meta {
	display: flex;
	gap: 12px;
	font-size: 12px;
	color: #9ca3af;
}

.mb-card-actions {
	display: flex;
	gap: 6px;
}

.mb-card-btn {
	padding: 6px 14px;
	font-size: 12px;
	font-weight: 500;
	background: rgba(255, 255, 255, 0.8);
	border: 1px solid rgba(255, 255, 255, 0.9);
	border-radius: 999px;
	cursor: pointer;
	color: #4b5563;
}

.mb-card-btn:hover { background: #fff; }
.mb-card-btn.danger { color: #dc2626; }

.mb-pager {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 16px;
	margin-top: 20px;
}

.mb-page-btn {
	padding: 8px 18px;
	font-size: 13px;
	font-weight: 600;
	color: #fff;
	background: linear-gradient(135deg, #ff6fa3, #6c8dff);
	border: none;
	border-radius: 999px;
	cursor: pointer;
}

.mb-page-info {
	font-size: 13px;
	color: #6b7280;
}
</style>
